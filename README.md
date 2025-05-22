# BizList

## Address Autocomplete Feature

BizList now includes an address autocomplete feature that provides suggestions as users type and automatically fills in address fields when a suggestion is selected.

### Setup Instructions

1. Obtain a Google Maps API key:

   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the "Places API" and "Geocoding API"
   - Create an API key with appropriate restrictions

2. Configure your environment:

   - Copy the `.env.local.example` file to `.env.local`
   - Add your Google Maps API key to the `.env.local` file:
     ```
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
     ```

3. Restart your development server

### Features

- Address suggestions appear as you type
- Selecting an address automatically fills in:
  - Street address
  - City
  - State/Province
  - Zip/Postal code
  - Country
- Individual address fields can still be manually edited after autocomplete
- Implemented in:
  - Provider registration form
  - User profile edit form
