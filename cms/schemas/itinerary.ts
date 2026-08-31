export const itinerary = {
  name: 'itineraryDay',
  title: 'Itinerary Day',
  type: 'document',
  fields: [
    {
      name: 'dayNumber',
      title: 'Day Number',
      type: 'number',
      validation: (Rule: any) => Rule.required().min(1),
    },
    {
      name: 'title',
      title: 'Day Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Activities Description',
      type: 'text',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'accommodation',
      title: 'Overnight Stay (Hotel/Camp name)',
      type: 'string',
    },
    {
      name: 'mealsProvided',
      title: 'Meals Provided',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Breakfast', value: 'breakfast' },
          { title: 'Lunch', value: 'lunch' },
          { title: 'Dinner', value: 'dinner' },
        ],
      },
    },
  ],
};
