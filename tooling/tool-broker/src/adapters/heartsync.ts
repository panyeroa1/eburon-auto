import fetch from "node-fetch";

// Assumes the Heartsync app is running locally or accessible via URL
const HEARTSYNC_URL = process.env.HEARTSYNC_URL || "http://127.0.0.1:7860";

export async function imageGenerateHeartsync(args: any) {
  // Gradio API usually exposes /api/predict
  const apiUrl = `${HEARTSYNC_URL}/api/predict`;

  // Mapping generic args to likely Gradio input signature.
  // This depends on the specific app.py implementation.
  // Assuming standard: [prompt, negative_prompt]
  // Some apps might take steps, guidance, seed, etc. in a specific order.
  // Without the specific app.py signature, we default to prompt + negative.
  
  const payload = {
    data: [
      args.prompt,
      args.negative_prompt || ""
    ]
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Heartsync API Error (${response.status}): ${text}`);
    }

    const json: any = await response.json();
    
    // Gradio returns { data: [ "data:image/png;base64,..." ] }
    // Or sometimes file paths. Assuming base64 data URI for now.
    
    if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        let imageData = json.data[0];
        
        // Check if it's a data URI
        if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
             const base64 = imageData.split(',')[1];
             return {
                data: {
                    kind: "image",
                    images: [{ mime: "image/png", b64: base64 }]
                },
                logs: [`Generated image via Heartsync at ${HEARTSYNC_URL}`]
            };
        }
        
        // Handle case where it might be a url or other format (mocking behavior if specific API is unknown)
        // If the space returns a file path/url, we might need to fetch it.
        // For now, let's assume direct base64 return which is common for simple Gradio apps.
    }

    throw new Error("Invalid response format from Heartsync API");

  } catch (err: any) {
    // If the local service isn't running, return a descriptive error
    if (err.code === 'ECONNREFUSED') {
        throw new Error(`Heartsync service not found at ${HEARTSYNC_URL}. Please run: python app.py`);
    }
    throw err;
  }
}
