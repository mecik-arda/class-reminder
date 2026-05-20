import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

interface NextClassWidgetProps {
  courseName: string;
  time: string;
  room: string;
}

export function NextClassWidget({ courseName, time, room }: NextClassWidgetProps) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#8B5CF6', // theme.purple.medium
        borderRadius: 16,
        padding: 16,
      }}
    >
      <TextWidget
        text={courseName || 'Ders Yok'}
        style={{
          fontSize: 20,
          fontFamily: 'sans-serif',
          color: '#FFFFFF',
          fontWeight: 'bold',
        }}
      />
      {time ? (
        <TextWidget
          text={`${time} ${room ? `• ${room}` : ''}`}
          style={{
            fontSize: 16,
            fontFamily: 'sans-serif',
            color: '#E5E7EB',
            marginTop: 8,
          }}
        />
      ) : null}
    </FlexWidget>
  );
}
