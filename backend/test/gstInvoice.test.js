const test = require('node:test');
const assert = require('node:assert');
const { calculateGST } = require('../src/utils/gstInvoice');

test('GST calculation for intra-state standard tour (5% rate)', () => {
  const result = calculateGST(10000, 'standard_tour', 'Gujarat');
  
  assert.strictEqual(result.baseAmount, 10000);
  assert.strictEqual(result.gstRate, 0.05);
  assert.strictEqual(result.gstAmount, 500);
  assert.strictEqual(result.totalAmount, 10500);
  assert.strictEqual(result.taxDetails.cgst, 250);
  assert.strictEqual(result.taxDetails.sgst, 250);
  assert.strictEqual(result.taxDetails.igst, 0);
  assert.strictEqual(result.taxDetails.cgstRate, 0.025);
  assert.strictEqual(result.taxDetails.sgstRate, 0.025);
});

test('GST calculation for inter-state standard tour (5% rate)', () => {
  const result = calculateGST(10000, 'standard_tour', 'Karnataka');
  
  assert.strictEqual(result.baseAmount, 10000);
  assert.strictEqual(result.gstRate, 0.05);
  assert.strictEqual(result.gstAmount, 500);
  assert.strictEqual(result.totalAmount, 10500);
  assert.strictEqual(result.taxDetails.cgst, 0);
  assert.strictEqual(result.taxDetails.sgst, 0);
  assert.strictEqual(result.taxDetails.igst, 500);
  assert.strictEqual(result.taxDetails.igstRate, 0.05);
});

test('GST calculation for hotel-inclusive booking (12% rate)', () => {
  const result = calculateGST(20000, 'hotel_inclusive', 'Gujarat');
  
  assert.strictEqual(result.baseAmount, 20000);
  assert.strictEqual(result.gstRate, 0.12);
  assert.strictEqual(result.gstAmount, 2400);
  assert.strictEqual(result.totalAmount, 22400);
  assert.strictEqual(result.taxDetails.cgst, 1200);
  assert.strictEqual(result.taxDetails.sgst, 1200);
  assert.strictEqual(result.taxDetails.igst, 0);
});

test('GST calculation for agent service fee (18% rate)', () => {
  const result = calculateGST(5000, 'agent_service', 'Maharashtra');
  
  assert.strictEqual(result.baseAmount, 5000);
  assert.strictEqual(result.gstRate, 0.18);
  assert.strictEqual(result.gstAmount, 900);
  assert.strictEqual(result.totalAmount, 5900);
  assert.strictEqual(result.taxDetails.cgst, 0);
  assert.strictEqual(result.taxDetails.sgst, 0);
  assert.strictEqual(result.taxDetails.igst, 900);
});

test('Throws error for invalid arguments', () => {
  assert.throws(() => {
    calculateGST(-100, 'standard_tour', 'Gujarat');
  }, /Base amount must be a positive number/);

  assert.throws(() => {
    calculateGST(10000, 'standard_tour', null);
  }, /Customer state is required for GST classification/);
});
