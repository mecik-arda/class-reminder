import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClassSession } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

interface ScheduleContextType {
  classes: ClassSession[];
  addClass: (newClass: ClassSession) => Promise<void>;
  updateClass: (updatedClass: ClassSession) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  setAllClasses: (classes: ClassSession[]) => Promise<void>;
  clearSchedule: () => Promise<void>;
  isLoading: boolean;
}

const ScheduleContext = createContext<ScheduleContextType>({
  classes: [],
  addClass: async () => {},
  updateClass: async () => {},
  deleteClass: async () => {},
  setAllClasses: async () => {},
  clearSchedule: async () => {},
  isLoading: true,
});

export const useSchedule = () => useContext(ScheduleContext);

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEYS.SCHEDULE);
      if (storedData) {
        setClasses(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSchedule = async (newClasses: ClassSession[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(newClasses));
      setClasses(newClasses);
    } catch (error) {
      console.error('Failed to save schedule:', error);
      throw error;
    }
  };

  const addClass = async (newClass: ClassSession) => {
    const updated = [...classes, newClass];
    await saveSchedule(updated);
  };

  const updateClass = async (updatedClass: ClassSession) => {
    const updated = classes.map(c => (c.id === updatedClass.id ? updatedClass : c));
    await saveSchedule(updated);
  };

  const deleteClass = async (id: string) => {
    const updated = classes.filter(c => c.id !== id);
    await saveSchedule(updated);
  };

  const setAllClasses = async (newClasses: ClassSession[]) => {
    await saveSchedule(newClasses);
  };

  const clearSchedule = async () => {
    await saveSchedule([]);
  };

  return (
    <ScheduleContext.Provider
      value={{
        classes,
        addClass,
        updateClass,
        deleteClass,
        setAllClasses,
        clearSchedule,
        isLoading,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};
