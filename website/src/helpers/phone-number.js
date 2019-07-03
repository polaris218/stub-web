export const getPhoneCode = (countryCode) => {
  if (!countryCode) {
    return 'US';
  }
  let country_code = countryCode.toUpperCase();

  if (countryCode === 'DE' || countryCode === 'GERMANY' || countryCode === 'DEU' || countryCode === 'DEUTSCH' || countryCode === 'DEUTSCHLAND') {
    return 'DE';
  } else if (country_code === 'SWITZERLAND' || country_code === 'SCHWEIZ' || country_code === 'SWISS' || country_code === 'SUISSE'|| country_code === 'SVIZZERA' || country_code === 'CH' || country_code === 'CHE') {
    return 'CH';
  } else if (country_code === 'AUSTRALIA' || country_code === 'AU' || country_code === 'AUS') {
    return 'AU';
  } else if (country_code === 'SOUTH AFRICA' || country_code === 'ZA' || country_code === 'ZAF') {
    return 'ZA';
  } else if (country_code === 'UNITED KINGDOM' || country_code === 'ENGLAND'  || country_code === 'ENG' || country_code === 'BRITISH' || country_code === 'GREAT BRITAIN' || country_code === 'BRITANNIA' || country_code === 'GB' || country_code === 'UK') {
    return 'GB';
  } else if (country_code === 'INDIA' || country_code === 'IN' || country_code === 'IND' || country_code === 'REPUBLIC OF INDIA' || country_code === 'THE REPUBLIC OF INDIA' || country_code === 'INDIAN REPUBLIC' || country_code === 'THE INDIAN REPUBLIC' ||  country_code === 'BHARAT' || country_code === 'HINDUSTAN' || country_code === 'HIND') {
    return 'IN';
  } else {
    return 'US';
  }
};
