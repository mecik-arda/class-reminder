import { ClassSession, LanguageCode } from '../types';

interface ScanResult {
  classes: Partial<ClassSession>[];
}

export const scanSchedule = async (
  base64Data: string,
  mimeType: string,
  language: LanguageCode,
  apiKey: string
): Promise<ScanResult> => {
  const prompt = language === 'tr'
    ? 'Bu ders programı görselindeki tüm dersleri analiz et ve çıkar. Günler için pazartesi=0, salı=1, çarşamba=2, perşembe=3, cuma=4, cumartesi=5, pazar=6 olacak şekilde sayısal değer ata.'
    : 'Analyze this class schedule image and extract all classes. For the day, use numeric values where Monday=0, Tuesday=1, Wednesday=2, Thursday=3, Friday=4, Saturday=5, Sunday=6.';

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                classes: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      courseName: { type: 'STRING' },
                      teacher: { type: 'STRING' },
                      classroom: { type: 'STRING' },
                      day: { type: 'INTEGER', description: '0 to 6 representing Monday to Sunday' },
                      startTime: { type: 'STRING', description: 'Start time of the class in HH:MM format' },
                      endTime: { type: 'STRING', description: 'End time of the class in HH:MM format' },
                    },
                    required: ['courseName', 'day', 'startTime', 'endTime'],
                  },
                },
              },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Gemini 1.5 JSON response parsing
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      throw new Error("No response text from Gemini API");
    }

    const parsedData = JSON.parse(textResponse);
    return parsedData;

  } catch (error) {
    console.error('Failed to scan schedule with Gemini:', error);
    throw error;
  }
};
