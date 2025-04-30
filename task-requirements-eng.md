# Task Requirements: Functional Data Table

**Task:** Create a "functional" table (similar to a spreadsheet) where rows can be filtered, sorted, and the table itself supports pagination. The data for the table is taken from the provided `data.ts` file.

## Basic Functional Requirements

- [ ] **Sorting:** The user can sort the data by any column (e.g. by clicking on the column header). Ascending and descending sorting must be provided.
- [ ] **Filtering/Searching:** There must be an input field for filtering/searching data by all or selected fields of the table in real time.
- [ ] **Pagination:**
    - [ ] The user can select the number of records to display on one page (e.g. 10, 25, 50).
    - [ ] The user can switch between pages of data.
- [ ] **Column Management:** The user can hide and show the table columns. It is necessary to think of a user-friendly way to manage the visibility of columns.

## Implementation Requirements

- [ ] **Code Quality:** Emphasis on functionality and code quality. The code should be clean, readable and maintainable.
- [ ] **Async:** A backend application is not required, but the frontend should simulate an asynchronous data request with a random response delay (to emulate network interaction).
- [ ] **Data Source:** Use the provided JSON file (`data.ts`) as a data source.

## Optional Requirements (Bonus Points)

- [ ] **Design:** Attractive design. Good UI/UX solutions are welcome.
- [ ] **Responsiveness:** Mobile-friendly design. Consider how the table will look and function on different screen sizes.