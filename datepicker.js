document.addEventListener('DOMContentLoaded', () => {
    class DateRangePicker {
        constructor(inputSelector, calendarContainerSelector) {
            this.input = document.querySelector(inputSelector);
            this.calendarContainer = document.querySelector(calendarContainerSelector);
            this.currentDate = new Date();
            this.startDate = null;
            this.endDate = null;
            this.tempEndDate = null; // For hover effect during selection
            this.isSelectingStartDate = true; // True if next click is for start date

            this.init();
        }

        init() {
            if (!this.input || !this.calendarContainer) {
                console.error('Date picker input or calendar container not found.');
                return;
            }

            this.renderCalendar(this.currentDate.getFullYear(), this.currentDate.getMonth());

            this.input.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent document click from immediately closing
                this.toggleCalendar();
            });

            document.addEventListener('click', (e) => {
                if (!this.calendarContainer.contains(e.target) && e.target !== this.input) {
                    this.closeCalendar();
                }
            });

            this.calendarContainer.addEventListener('click', (e) => {
                e.stopPropagation(); // Keep calendar open on clicks inside it
            });

            // Initial display based on saved or default dates
            this.loadSavedRange();
            this.updateInputDisplay();
            this.highlightSelectedRange();
        }

        toggleCalendar() {
            this.calendarContainer.classList.toggle('show');
            if (this.calendarContainer.classList.contains('show')) {
                // When opening, navigate to the start date's month if a range is selected
                const dateToShow = this.startDate || this.currentDate;
                this.renderCalendar(dateToShow.getFullYear(), dateToShow.getMonth());
            }
        }

        closeCalendar() {
            this.calendarContainer.classList.remove('show');
            // If only a start date was selected, reset it on close without "Done"
            if (this.startDate && !this.endDate && this.isSelectingStartDate === false) {
                 this.startDate = null;
                 this.isSelectingStartDate = true;
                 this.updateInputDisplay(); // Clear the partial display
                 this.highlightSelectedRange();
            }
            this.tempEndDate = null; // Clear temporary hover highlighting
        }

        renderCalendar(year, month) {
            this.calendarContainer.innerHTML = ''; // Clear previous calendar

            const header = this.createHeader(year, month);
            this.calendarContainer.appendChild(header);

            const grid = this.createGrid(year, month);
            this.calendarContainer.appendChild(grid);

            const actions = this.createActions();
            this.calendarContainer.appendChild(actions);

            this.highlightSelectedRange();
        }

        createHeader(year, month) {
            const header = document.createElement('div');
            header.classList.add('calendar-header');

            const prevButton = document.createElement('button');
            prevButton.classList.add('nav-button');
            prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
            prevButton.addEventListener('click', () => this.navigateMonth(-1));

            const nextButton = document.createElement('button');
            nextButton.classList.add('nav-button');
            nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
            nextButton.addEventListener('click', () => this.navigateMonth(1));

            const monthYearDisplay = document.createElement('span');
            monthYearDisplay.classList.add('current-month-year');
            const date = new Date(year, month);
            monthYearDisplay.textContent = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });

            header.appendChild(prevButton);
            header.appendChild(monthYearDisplay);
            header.appendChild(nextButton);

            return header;
        }

        createGrid(year, month) {
            const grid = document.createElement('div');
            grid.classList.add('calendar-grid');

            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            daysOfWeek.forEach(day => {
                const dayOfWeekElement = document.createElement('div');
                dayOfWeekElement.classList.add('day-of-week');
                dayOfWeekElement.textContent = day;
                grid.appendChild(dayOfWeekElement);
            });

            const firstDayOfMonth = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const daysInPrevMonth = new Date(year, month, 0).getDate();

            // Fill leading empty days (from previous month)
            for (let i = 0; i < firstDayOfMonth; i++) {
                const dayElement = document.createElement('div');
                dayElement.classList.add('calendar-day', 'other-month', 'disabled');
                dayElement.textContent = daysInPrevMonth - firstDayOfMonth + i + 1;
                grid.appendChild(dayElement);
            }

            // Fill days of the current month
            for (let day = 1; day <= daysInMonth; day++) {
                const dayElement = document.createElement('div');
                dayElement.classList.add('calendar-day');
                dayElement.textContent = day;
                dayElement.dataset.date = new Date(year, month, day).toDateString();
                dayElement.addEventListener('click', () => this.selectDate(new Date(year, month, day)));
                dayElement.addEventListener('mouseenter', () => this.handleDayHover(new Date(year, month, day)));
                dayElement.addEventListener('mouseleave', () => this.handleDayLeave());
                grid.appendChild(dayElement);
            }

            // Fill trailing empty days (from next month)
            const totalDaysRendered = firstDayOfMonth + daysInMonth;
            const remainingCells = 42 - totalDaysRendered; // Max 6 rows * 7 days
            for (let i = 1; i <= remainingCells; i++) {
                const dayElement = document.createElement('div');
                dayElement.classList.add('calendar-day', 'other-month', 'disabled');
                dayElement.textContent = i;
                grid.appendChild(dayElement);
            }

            return grid;
        }

        createActions() {
            const actions = document.createElement('div');
            actions.classList.add('calendar-actions');

            const clearButton = document.createElement('button');
            clearButton.classList.add('action-button', 'clear-button');
            clearButton.textContent = 'CLEAR';
            clearButton.addEventListener('click', () => this.clearSelection());

            const doneButton = document.createElement('button');
            doneButton.classList.add('action-button', 'done-button');
            doneButton.textContent = 'DONE';
            doneButton.addEventListener('click', () => this.confirmSelection());

            actions.appendChild(clearButton);
            actions.appendChild(doneButton);

            return actions;
        }

        navigateMonth(direction) {
            this.currentDate.setMonth(this.currentDate.getMonth() + direction);
            this.renderCalendar(this.currentDate.getFullYear(), this.currentDate.getMonth());
            this.highlightSelectedRange(); // Re-highlight after navigation
        }

        selectDate(date) {
            // Normalize date to start of day for comparison
            const normalizeDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
            const selectedDate = normalizeDate(date);

            if (this.isSelectingStartDate || !this.startDate) {
                // First click or re-selecting start date
                this.startDate = selectedDate;
                this.endDate = null; // Clear end date if present
                this.isSelectingStartDate = false;
            } else {
                // Second click for end date
                if (selectedDate < this.startDate) {
                    // If selected date is before start date, swap them
                    this.endDate = this.startDate;
                    this.startDate = selectedDate;
                } else {
                    this.endDate = selectedDate;
                }
                this.isSelectingStartDate = true; // Next click will be a new start date
            }
            this.tempEndDate = null; // Clear hover state when a date is clicked
            this.highlightSelectedRange();
            this.updateInputDisplay(); // Update input immediately on selection
        }

        handleDayHover(hoverDate) {
            if (this.startDate && !this.endDate && !this.isSelectingStartDate) {
                // Only apply hover if a start date is selected and we're looking for an end date
                this.tempEndDate = hoverDate;
                this.highlightSelectedRange();
            }
        }

        handleDayLeave() {
            if (this.startDate && !this.endDate && !this.isSelectingStartDate) {
                // Clear temporary hover state if mouse leaves without selecting
                this.tempEndDate = null;
                this.highlightSelectedRange();
            }
        }

        highlightSelectedRange() {
            const normalizeDate = (d) => d ? new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() : null;

            const startMs = normalizeDate(this.startDate);
            const endMs = normalizeDate(this.endDate || this.tempEndDate); // Use tempEndDate for hover

            const dayElements = this.calendarContainer.querySelectorAll('.calendar-day:not(.other-month)');

            dayElements.forEach(dayEl => {
                const date = new Date(dayEl.dataset.date);
                const dayMs = normalizeDate(date);

                dayEl.classList.remove('selected', 'start-date', 'end-date', 'in-range');

                if (startMs && dayMs === startMs) {
                    dayEl.classList.add('selected', 'start-date');
                }
                if (endMs && dayMs === endMs) {
                    dayEl.classList.add('selected', 'end-date');
                }

                // Apply in-range highlighting
                if (startMs && endMs && dayMs >= Math.min(startMs, endMs) && dayMs <= Math.max(startMs, endMs)) {
                    dayEl.classList.add('in-range');
                }

                // If only start date is selected and no end date yet, apply single selected style
                if (this.startDate && !this.endDate && !this.tempEndDate && dayMs === startMs) {
                    dayEl.classList.add('selected');
                }

                // Special case for single day selection to keep rounded corners
                if (this.startDate && this.endDate && startMs === endMs && dayMs === startMs) {
                    dayEl.classList.add('selected', 'start-date', 'end-date', 'in-range'); // Add all for single selected day
                }
            });
        }

        updateInputDisplay() {
            const format = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            if (this.startDate && this.endDate) {
                this.input.value = `${format(this.startDate)} - ${format(this.endDate)}`;
            } else if (this.startDate) {
                this.input.value = `${format(this.startDate)} - (Select End Date)`;
            } else {
                this.input.value = '';
                this.input.placeholder = 'Select date range';
            }
        }

        confirmSelection() {
            // If only start date is selected, make it a single-day range
            if (this.startDate && !this.endDate) {
                this.endDate = this.startDate;
            } else if (!this.startDate && !this.endDate) {
                // If nothing selected, clear input
                this.input.value = '';
            }
            this.updateInputDisplay();
            this.saveSelectedRange();
            this.closeCalendar();
        }

        clearSelection() {
            this.startDate = null;
            this.endDate = null;
            this.tempEndDate = null;
            this.isSelectingStartDate = true;
            this.updateInputDisplay();
            this.highlightSelectedRange(); // Clear highlights on calendar
            localStorage.removeItem('selectedDateRange'); // Clear saved state
            this.renderCalendar(new Date().getFullYear(), new Date().getMonth()); // Reset calendar view
        }

        saveSelectedRange() {
            if (this.startDate && this.endDate) {
                const range = {
                    start: this.startDate.toISOString(),
                    end: this.endDate.toISOString()
                };
                localStorage.setItem('selectedDateRange', JSON.stringify(range));
            } else {
                localStorage.removeItem('selectedDateRange');
            }
        }

        loadSavedRange() {
            const savedRange = localStorage.getItem('selectedDateRange');
            if (savedRange) {
                const { start, end } = JSON.parse(savedRange);
                this.startDate = new Date(start);
                this.endDate = new Date(end);
                this.currentDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), 1); // Set calendar to start month
            }
        }
    }

    // Initialize the date picker for a specific input and its associated calendar container
    new DateRangePicker('#reportDateRangeInput', '#reportDateRangeCalendar');
});