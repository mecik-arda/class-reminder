import { ClassSession, LanguageCode } from '../types';

interface ScanResult {
  classes: Partial<ClassSession>[];
}

export const scanSchedule = async (
  imageBase64: string, 
  language: LanguageCode, 
  apiKey: string
): Promise<ScanResult> => {
  const prompt = language === 'tr' 
    ? `Bu görüntüdeki ders programı bilgilerini çıkar. Sadece JSON formatında ve tam olarak şu yapıda döndür:
      {
        "classes": [
          {
            "courseName": "string",
            "teacher": "string (opsiyonel)",
            "classroom": "string (opsiyonel)",
            "day": number (0-6 arası, 0 Pazartesi, 6 Pazar),
            "startTime": "string (HH:MM formatında)",
            "endTime": "string (HH:MM formatında)"
          }
        ]
      }
      Başka hiçbir metin veya açıklama ekleme, sadece JSON objesini döndür.`
    : `Extract class schedule information from this image. Return strictly in JSON format with exactly this structure:
      {
        "classes": [
          {
            "courseName": "string",
            "teacher": "string (optional)",
            "classroom": "string (optional)",
            "day": number (0-6 where 0 is Monday, 6 is Sunday),
            "startTime": "string (HH:MM format)",
            "endTime": "string (HH:MM format)"
          }
        ]
      }
      Do not include any other text or explanation, only the JSON object.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        temperature: 0,
        system: "You are a specialized AI designed to extract class schedules from images into precise JSON formats.",
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg', // the picker returns jpeg typically
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API Error:', errorText);
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    const messageContent = data.content[0].text;
    
    // Find the JSON part in case Claude included markdown formatting like ```json
    const jsonMatch = messageContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedData = JSON.parse(jsonMatch[0]);
      return parsedData;
    } else {
      throw new Error("Could not parse JSON from response");
    }

  } catch (error) {
    console.error('Failed to scan schedule:', error);
    throw error;
  }
};
