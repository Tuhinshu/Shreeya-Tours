/**
 * GST Invoicing Engine for B2C Travel Bookings
 */

/**
 * Calculates GST based on booking type and customer location.
 * 
 * GST Rules:
 * - standard_tour (Transport, sightseeing, standard packages): 5% GST (No ITC)
 * - hotel_inclusive (Premium lodging included): 12% GST
 * - agent_service (Agency fees, convenience charges, luxury custom itinerary): 18% GST
 * 
 * Inter-state vs Intra-state:
 * - If customerState === officeState, apply CGST + SGST (split equally).
 * - If customerState !== officeState, apply IGST (full rate).
 * 
 * @param {number} baseAmount - The base price of the booking.
 * @param {string} bookingType - The category: 'standard_tour', 'hotel_inclusive', or 'agent_service'.
 * @param {string} customerState - The billing state of the customer.
 * @param {string} [officeState='Gujarat'] - The registered location of the travel agency.
 * @returns {object} The GST calculation breakdown.
 */
function calculateGST(baseAmount, bookingType, customerState, officeState = 'Gujarat') {
  if (typeof baseAmount !== 'number' || baseAmount <= 0) {
    throw new Error('Base amount must be a positive number');
  }
  if (!customerState || typeof customerState !== 'string') {
    throw new Error('Customer state is required for GST classification');
  }

  // Determine GST rate based on booking type
  let gstRate = 0.18; // Default to 18%
  switch (bookingType) {
    case 'standard_tour':
      gstRate = 0.05;
      break;
    case 'hotel_inclusive':
      gstRate = 0.12;
      break;
    case 'agent_service':
      gstRate = 0.18;
      break;
    default:
      gstRate = 0.18;
  }

  const gstAmount = Math.round(baseAmount * gstRate * 100) / 100;
  const totalAmount = Math.round((baseAmount + gstAmount) * 100) / 100;

  const isSameState = customerState.trim().toLowerCase() === officeState.trim().toLowerCase();

  const taxDetails = {
    cgst: 0,
    sgst: 0,
    igst: 0,
    cgstRate: 0,
    sgstRate: 0,
    igstRate: 0
  };

  if (isSameState) {
    const halfRate = gstRate / 2;
    taxDetails.cgstRate = halfRate;
    taxDetails.sgstRate = halfRate;
    taxDetails.cgst = Math.round((gstAmount / 2) * 100) / 100;
    taxDetails.sgst = Math.round((gstAmount / 2) * 100) / 100;
  } else {
    taxDetails.igstRate = gstRate;
    taxDetails.igst = gstAmount;
  }

  return {
    baseAmount,
    bookingType,
    gstRate,
    gstAmount,
    taxDetails,
    totalAmount,
    customerState,
    officeState,
    invoiceDate: new Date().toISOString()
  };
}

module.exports = {
  calculateGST
};
