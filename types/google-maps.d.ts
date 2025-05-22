declare global {
  interface Window {
    google: {
      maps: {
        places: {
          AutocompleteService: new () => google.maps.places.AutocompleteService;
          PlacesServiceStatus: {
            OK: string;
            ZERO_RESULTS: string;
            OVER_QUERY_LIMIT: string;
            REQUEST_DENIED: string;
            INVALID_REQUEST: string;
            UNKNOWN_ERROR: string;
          };
        };
      };
    };
  }
}

declare namespace google.maps.places {
  interface AutocompleteService {
    getPlacePredictions(
      request: AutocompletionRequest,
      callback: (
        predictions: AutocompletePrediction[] | null,
        status: PlacesServiceStatus
      ) => void
    ): void;
  }

  interface AutocompletePrediction {
    description: string;
    place_id: string;
    structured_formatting: {
      main_text: string;
      main_text_matched_substrings: {
        offset: number;
        length: number;
      }[];
      secondary_text: string;
    };
    types: string[];
    matched_substrings: {
      offset: number;
      length: number;
    }[];
    terms: {
      offset: number;
      value: string;
    }[];
  }

  interface AutocompletionRequest {
    input: string;
    types?: string[];
    componentRestrictions?: {
      country: string | string[];
    };
    sessionToken?: any;
    bounds?: any;
    location?: any;
    offset?: number;
    origin?: any;
    radius?: number;
  }
  
  type PlacesServiceStatus = 
    | 'OK'
    | 'ZERO_RESULTS'
    | 'OVER_QUERY_LIMIT'
    | 'REQUEST_DENIED'
    | 'INVALID_REQUEST'
    | 'UNKNOWN_ERROR';
}

export {};