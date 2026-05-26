import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { caption, imageBase64, imageType } = body;

    if (!caption) {
      return NextResponse.json({ error: 'Missing caption content' }, { status: 400 });
    }

    // Default fallback image forced to return JPEG (Instagram demands JPEG/PNG)
    let imageUrl = "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=1000&fm=jpg";

    if (imageBase64) {
      try {
        const buffer = Buffer.from(imageBase64, 'base64');
        let ext = 'jpg';
        if (imageType) {
          const matched = imageType.match(/\/([a-zA-Z0-9]+)/);
          if (matched && matched[1]) {
            ext = matched[1];
          }
        }
        
        // Native Blob in Node.js
        const blob = new Blob([buffer], { type: imageType || 'image/jpeg' });
        const uploadFormData = new FormData();
        uploadFormData.append('file', blob, `upload.${ext}`);

        console.log('Attempting to upload uploaded image to tmpfiles.org...');
        const uploadResponse = await fetch('https://tmpfiles.org/api/v1/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          if (uploadData && uploadData.status === 'success' && uploadData.data?.url) {
            // Transform tmpfiles.org URL to direct download URL (tmpfiles.org/XXXX/file.ext -> tmpfiles.org/dl/XXXX/file.ext)
            imageUrl = uploadData.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
            console.log('Successfully uploaded image to tmpfiles.org. Direct URL:', imageUrl);
          } else {
            console.warn('tmpfiles.org upload returned non-success response:', uploadData);
            throw new Error('Non-success response from tmpfiles.org');
          }
        } else {
          console.warn('tmpfiles.org upload failed with status:', uploadResponse.status);
          throw new Error(`Status ${uploadResponse.status} from tmpfiles.org`);
        }
      } catch (primaryError) {
        console.error('Primary upload via tmpfiles.org failed, trying fallback to catbox.moe...', primaryError);
        try {
          const buffer = Buffer.from(imageBase64, 'base64');
          let ext = 'jpg';
          if (imageType) {
            const matched = imageType.match(/\/([a-zA-Z0-9]+)/);
            if (matched && matched[1]) {
              ext = matched[1];
            }
          }
          const blob = new Blob([buffer], { type: imageType || 'image/jpeg' });
          const catboxFormData = new FormData();
          catboxFormData.append('reqtype', 'fileupload');
          catboxFormData.append('fileToUpload', blob, `upload.${ext}`);

          console.log('Uploading image to catbox.moe...');
          const catboxResponse = await fetch('https://catbox.moe/user/api.php', {
            method: 'POST',
            body: catboxFormData,
          });

          if (catboxResponse.ok) {
            const textUrl = await catboxResponse.text();
            if (textUrl.startsWith('https://')) {
              imageUrl = textUrl.trim();
              console.log('Successfully uploaded image to catbox.moe. Direct URL:', imageUrl);
            } else {
              console.warn('Catbox upload response was not a valid URL:', textUrl);
            }
          } else {
            console.warn('Catbox upload failed with status:', catboxResponse.status);
          }
        } catch (fallbackError) {
          console.error('Fallback upload to catbox.moe also failed:', fallbackError);
        }
      }
    }

    const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

    if (!MAKE_WEBHOOK_URL) {
      return NextResponse.json({ error: 'Missing MAKE_WEBHOOK_URL environment variable' }, { status: 500 });
    }

    // Send clean JSON instead of multipart form data. This makes Make configuration 10x easier!
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caption: caption,
        imageUrl: imageUrl
      }),
    });

    if (!response.ok) {
      throw new Error(`Make.com connection error: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Publish error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}