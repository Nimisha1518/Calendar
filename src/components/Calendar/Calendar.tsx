'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  isBefore
} from 'date-fns';
import { ChevronLeft, ChevronRight, StickyNote, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import styles from './Calendar.module.css';

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null, end: Date | null }>({
    start: null,
    end: null,
  });
  const [notes, setNotes] = useState<string>('');
  const [direction, setDirection] = useState(0);

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  useEffect(() => {
    const key = selectedRange.start 
      ? `notes-${format(selectedRange.start, 'yyyy-MM-dd')}`
      : `notes-${format(currentMonth, 'yyyy-MM')}`;
    const savedNotes = localStorage.getItem(key);
    setNotes(savedNotes || '');
  }, [currentMonth, selectedRange.start]);

  const saveNotes = (val: string) => {
    setNotes(val);
    const key = selectedRange.start 
      ? `notes-${format(selectedRange.start, 'yyyy-MM-dd')}`
      : `notes-${format(currentMonth, 'yyyy-MM')}`;
    localStorage.setItem(key, val);
  };

  const nextMonth = () => {
    setDirection(1);
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setDirection(-1);
    setCurrentMonth(subMonths(currentMonth, 1));
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className={styles.navButton} onClick={prevMonth}>
            <ChevronLeft size={24} />
          </div>
          <div className={styles.navButton} onClick={nextMonth}>
            <ChevronRight size={24} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', background: 'var(--primary-light)', padding: '8px 16px', borderRadius: '12px' }}>
          <CalendarIcon size={18} />
          <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '0.5px' }}>{format(currentMonth, 'MMMM yyyy')}</span>
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

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isSel = isSelected(cloneDay);
        const isInRng = isRange(cloneDay);
        const isOut = !isSameMonth(cloneDay, monthStart);
        
        let cellClasses = styles.dateCell;
        if (isOut) cellClasses += ` ${styles.outsideMonth}`;
        if (isSel) cellClasses += ` ${styles.selectedDate}`;
        if (isInRng && !isSel) cellClasses += ` ${styles.rangeMiddle}`;
        
        const isStart = isSel && selectedRange.start && isSameDay(cloneDay, selectedRange.start) && selectedRange.end;
        const isEnd = isSel && selectedRange.end && isSameDay(cloneDay, selectedRange.end);
        
        if (isStart) cellClasses += ` ${styles.rangeStart}`;
        if (isEnd) cellClasses += ` ${styles.rangeEnd}`;

        days.push(
          <motion.div
            key={day.toString()}
            className={cellClasses}
            onClick={() => !isOut && onDateClick(cloneDay)}
            whileHover={!isOut ? { scale: 1.15, zIndex: 10, y: -5 } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <span>{format(day, "d")}</span>
            {isSameDay(day, new Date()) && !isSel && (
              <div style={{ position: 'absolute', bottom: '6px', width: '4px', height: '4px', background: 'var(--primary)', borderRadius: '50%' }} />
            )}
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

  const pageVariants = {
    enter: (direction: number) => ({
      rotateY: direction > 0 ? 45 : -45,
      opacity: 0,
      x: direction > 0 ? 50 : -50,
      scale: 0.95,
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      x: 0,
      scale: 1,
    },
    exit: (direction: number) => ({
      rotateY: direction > 0 ? -45 : 45,
      opacity: 0,
      x: direction > 0 ? -50 : 50,
      scale: 0.95,
    }),
  };

  return (
    <div className={styles.calendarWrapper}>
      <motion.div 
        className={styles.calendarContainer}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY }}
      >
        <div className={styles.binder}>
          {[...Array(12)].map((_, i) => (
            <div key={i} className={styles.ring} />
          ))}
        </div>
        
        <div className={styles.contentWrapper}>
          <div className={styles.heroSection}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentMonth.toString() + 'img'}
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: '100%', height: '100%', position: 'relative' }}
              >
                <img 
                  src={currentMonth.getMonth() === 0 ? "/images/january.png" : `https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1000`} 
                  alt="Hero" 
                  className={styles.heroImage} 
                />
                <div className={styles.heroOverlay}>
                  <motion.h1 
                    className={styles.monthLabel}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.7 }}
                  >
                    {format(currentMonth, 'MMMM')}
                  </motion.h1>
                  <motion.p 
                    className={styles.yearLabel}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.7 }}
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
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {renderDays()}
                {renderCells()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className={styles.notesSection}>
          <div className={`${styles.notesHeader} flex items-center justify-between`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700 }}>
              <StickyNote size={20} />
              <span>{selectedRange.start ? `Notes for ${format(selectedRange.start, 'MMM d, yyyy')}` : 'Monthly Intentions'}</span>
            </div>
            {selectedRange.start && (
              <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} />
                Selected: {format(selectedRange.start, 'MMM d')} 
                {selectedRange.end ? ` - ${format(selectedRange.end, 'MMM d')}` : ''}
              </div>
            )}
          </div>
          <textarea
            className={styles.notesInput}
            placeholder={selectedRange.start ? `Writing notes for ${format(selectedRange.start, 'MMMM d')}...` : "Select a date to add specific notes."}
            value={notes}
            onChange={(e) => saveNotes(e.target.value)}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Calendar;
