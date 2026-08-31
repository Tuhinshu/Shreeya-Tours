export const faq = {
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    {
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'answer',
      title: 'Answer',
      type: 'text',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'General Query', value: 'general' },
          { title: 'Booking & Cancellation', value: 'booking_cancellation' },
          { title: 'Payments & GST', value: 'payments_gst' },
          { title: 'Tour Specific', value: 'tour_specific' },
        ],
      },
    },
  ],
};
