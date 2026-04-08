'use client';

import React, { useState, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  isWithinInterval,
  isBefore,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, StickyNote, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Calendar.module.css';

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null, end: Date | null }>({
    start: null,
    end: null,
  });
  const [notes, setNotes] = useState<string>('');
  const [direction, setDirection] = useState(0);

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem(`notes-${format(currentMonth, 'yyyy-MM')}`);
    setNotes(savedNotes || '');
  }, [currentMonth]);

  const saveNotes = (val: string) => {
    setNotes(val);
    localStorage.setItem(`notes-${format(currentMonth, 'yyyy-MM')}`, val);
  };

  const nextMonth = () => {
    setDirection(1);
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setDirection(-1);
    setCurrentMonth(subMonths(currentMonth, -1)); // Corrected to subMonths(currentMonth, 1)
  };

  const onDateClick = (day: Date) => {
    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      setSelectedRange({ start: day, end: null });
    } else {
      if (isBefore(day, selectedRange.start)) {
        setSelectedRange({ start: day, end: selectedRange.start });
      } else {
        setSelectedRange({ start: selectedRange.start, end: day });
      }
    }
  };

  const isSelected = (day: Date) => {
    if (selectedRange.start && isSameDay(day, selectedRange.start)) return true;
    if (selectedRange.end && isSameDay(day, selectedRange.end)) return true;
    return false;
  };

  const isRange = (day: Date) => {
    if (selectedRange.start && selectedRange.end) {
      return isWithinInterval(day, { start: selectedRange.start, end: selectedRange.end });
    }
    return false;
  };

  const renderHeader = () => {
    return (
      <div className={styles.calendarHeader}>
        <div className={styles.navButtons}>
          <button className={styles.navButton} onClick={() => { setDirection(-1); setCurrentMonth(subMonths(currentMonth, 1)); }}>
            <ChevronLeft size={20} />
          </button>
          <button className={styles.navButton} onClick={() => { setDirection(1); setCurrentMonth(addMonths(currentMonth, 1)); }}>
            <ChevronRight size={20} />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary)' }}>
          <CalendarIcon size={16} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{format(currentMonth, 'MMMM yyyy')}</span>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let i = 0; i < 7; i++) {
      days.push(
        <div className={styles.weekday} key={i}>
          {dateNames[i]}
        </div>
      );
    }
    return <div className={styles.weekdayGrid}>{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        
        const isSel = isSelected(cloneDay);
        const isInRng = isRange(cloneDay);
        const isOut = !isSameMonth(cloneDay, monthStart);
        
        let cellClasses = styles.dateCell;
        if (isOut) cellClasses += ` ${styles.outsideMonth}`;
        if (isSel) cellClasses += ` ${styles.selectedDate}`;
        if (isInRng && !isSel) cellClasses += ` ${styles.rangeMiddle}`;
        if (isSel && selectedRange.start && isSameDay(cloneDay, selectedRange.start) && selectedRange.end) cellClasses += ` ${styles.rangeStart}`;
        if (isSel && selectedRange.end && isSameDay(cloneDay, selectedRange.end)) cellClasses += ` ${styles.rangeEnd}`;

        days.push(
          <motion.div
            key={day.toString()}
            className={cellClasses}
            onClick={() => !isOut && onDateClick(cloneDay)}
            whileHover={!isOut ? { scale: 1.1, zIndex: 10 } : {}}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span>{formattedDate}</span>
          </motion.div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className={styles.dateGrid} key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className={styles.body}>{rows}</div>;
  };

  const variants = {
    enter: (direction: number) => ({
      rotateY: direction > 0 ? 90 : -90,
      opacity: 0,
      x: direction > 0 ? 100 : -100,
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      x: 0,
    },
    exit: (direction: number) => ({
      rotateY: direction > 0 ? -90 : 90,
      opacity: 0,
      x: direction > 0 ? -100 : 100,
    }),
  };

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.binder}>
        {[...Array(10)].map((_, i) => (
          <div key={i} className={styles.ring} />
        ))}
      </div>
      
      <div className={styles.contentWrapper}>
        <div className={styles.heroSection}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentMonth.toString() + 'img'}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{ width: '100%', height: '100%', position: 'relative' }}
            >
              <img 
                src={currentMonth.getMonth() === 0 ? "/images/january.png" : `https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1000`} 
                alt="Hero" 
                className={styles.heroImage} 
              />
              <div className={styles.heroOverlay}>
                <motion.h1 
                  className={styles.monthLabel}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {format(currentMonth, 'MMMM')}
                </motion.h1>
                <motion.p 
                  className={styles.yearLabel}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {format(currentMonth, 'yyyy')}
                </motion.p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={styles.gridSection}>
          {renderHeader()}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentMonth.toString() + 'grid'}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {renderDays()}
              {renderCells()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className={styles.notesSection}>
        <div className={styles.notesHeader}>
          <StickyNote size={18} />
          <span>Monthly Notes</span>
        </div>
        <textarea
          className={styles.notesInput}
          placeholder="Jot down your plans for this month..."
          value={notes}
          onChange={(e) => saveNotes(e.target.value)}
        />
        {selectedRange.start && (
          <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500 }}>
            Selection: {format(selectedRange.start, 'MMM d')} 
            {selectedRange.end ? ` - ${format(selectedRange.end, 'MMM d')}` : ' (Select end date)'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
