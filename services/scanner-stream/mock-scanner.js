// Mock scanner data generator for testing
const mockTransmissions = [
  { type: 'police', unit: 'Unit 12', message: 'Traffic stop at Cleveland and Perkins' },
  { type: 'fire', unit: 'Engine 3', message: 'Responding to fire alarm at Sandusky Mall' },
  { type: 'ems', unit: 'Medic 1', message: 'Transport to Firelands Medical Center' },
  { type: 'police', unit: 'Unit 7', message: 'Clearing from Venice Road call' },
  { type: 'police', unit: 'Unit 23', message: 'Request backup at Columbus Avenue' },
  { type: 'fire', unit: 'Ladder 2', message: 'On scene, nothing showing' },
  { type: 'ems', unit: 'Medic 3', message: 'Patient refusal, returning to station' },
  { type: 'police', unit: 'Unit 15', message: 'Code 4, situation under control' }
];

function generateMockTransmission() {
  const transmission = mockTransmissions[Math.floor(Math.random() * mockTransmissions.length)];
  return {
    ...transmission,
    timestamp: new Date().toISOString(),
    id: Math.random().toString(36).substr(2, 9)
  };
}

module.exports = {
  generateMockTransmission,
  mockTransmissions
};