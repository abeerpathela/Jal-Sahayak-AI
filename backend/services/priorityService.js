export const predictPriority = (description, category) => {
  const desc = description.toLowerCase();
  
  // High Priority Keywords
  const highPriorityKeywords = ['no water', '3 days', 'leakage', 'urgent', 'broken pipe'];
  const mediumPriorityKeywords = ['dirty', 'smell', 'pressure', 'slow'];

  if (highPriorityKeywords.some(keyword => desc.includes(keyword))) {
    return 'HIGH';
  }

  if (mediumPriorityKeywords.some(keyword => desc.includes(keyword))) {
    return 'MEDIUM';
  }

  if (category === 'Water Supply Issue') {
    return 'MEDIUM'; // Default for supply issues
  }

  return 'LOW';
};
