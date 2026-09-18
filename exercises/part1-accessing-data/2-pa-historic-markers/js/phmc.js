const historicMarkerCategories = [
  { code: 1, label: 'Abraham Lincoln' },
  { code: 2, label: 'African American' },
  { code: 3, label: 'Agriculture' },
  { code: 4, label: 'American Revolution' },
  { code: 5, label: 'Artists' },
  { code: 69, label: 'Asian Pacific American' },
  { code: 6, label: 'Baseball' },
  { code: 7, label: 'Basketball' },
  { code: 57, label: 'Bridges' },
  { code: 8, label: 'Buildings & Architecture' },
  { code: 9, label: 'Business & Industry' },
  { code: 10, label: 'Canals' },
  { code: 11, label: 'Cities & Towns' },
  { code: 12, label: 'Civil Rights' },
  { code: 13, label: 'Civil War' },
  { code: 14, label: 'Coal' },
  { code: 15, label: 'Early Settlement' },
  { code: 16, label: 'Education' },
  { code: 58, label: 'Electricity' },
  { code: 17, label: 'Entrepreneurs' },
  { code: 18, label: 'Environment' },
  { code: 19, label: 'Ethnic & Immigration' },
  { code: 20, label: 'Exploration' },
  { code: 59, label: 'Folklore' },
  { code: 21, label: 'Football' },
  { code: 22, label: 'Forts' },
  { code: 23, label: 'French & Indian War' },
  { code: 24, label: 'Furnaces' },
  { code: 25, label: 'George Washington' },
  { code: 60, label: 'Glass' },
  { code: 26, label: 'Government & Politics' },
  { code: 27, label: 'Government & Politics 17th Century' },
  { code: 28, label: 'Government & Politics 18th Century' },
  { code: 29, label: 'Government & Politics 19th Century' },
  { code: 30, label: 'Government & Politics 20th Century' },
  { code: 31, label: 'Governors' },
  { code: 61, label: 'Houses & Homesteads' },
  { code: 32, label: 'Inns & Taverns' },
  { code: 33, label: 'Invention' },
  { code: 34, label: 'Iron & Steel' },
  { code: 35, label: 'Labor' },
  { code: 68, label: 'Latino American' },
  { code: 67, label: 'LGBTQ' },
  { code: 36, label: 'Mansions & Manors' },
  { code: 37, label: 'Military' },
  { code: 38, label: 'Military Post-Civil War' },
  { code: 62, label: 'Mills' },
  { code: 39, label: 'Motion Pictures & Television' },
  { code: 40, label: 'Music & Theater' },
  { code: 41, label: 'Native American' },
  { code: 63, label: 'Navigation' },
  { code: 42, label: 'Oil & Gas' },
  { code: 64, label: 'Paths & Trails' },
  { code: 43, label: 'Performers' },
  { code: 44, label: 'Police and Safety' },
  { code: 45, label: 'Professions & Vocations' },
  { code: 46, label: 'Publishing & Journalism' },
  { code: 47, label: 'Railroads' },
  { code: 48, label: 'Religion' },
  { code: 65, label: 'Roads' },
  { code: 49, label: 'Science & Medicine' },
  { code: 50, label: 'Sports & Recreation' },
  { code: 51, label: 'Transportation' },
  { code: 52, label: 'Underground Railroad' },
  { code: 53, label: 'War of 1812' },
  { code: 66, label: 'Whiskey Rebellion' },
  { code: 54, label: 'William Penn' },
  { code: 55, label: 'Women' },
  { code: 56, label: 'Writers' },
];

/**
 * Populates a given select element with options for each historic marker
 * category. Uses the `historicMarkerCategories` array, built by analyzing the
 * PHMC marker search tool.
 * @param {HTMLSelectElement} selectElement The select element to populate.
 */
function populateCategorySelect(selectElement) {
  for (const category of historicMarkerCategories) {
    const option = document.createElement('option');
    option.value = category.code;
    option.textContent = category.label;
    selectElement.appendChild(option);
  }
}

export {
  historicMarkerCategories,
  populateCategorySelect,
};
