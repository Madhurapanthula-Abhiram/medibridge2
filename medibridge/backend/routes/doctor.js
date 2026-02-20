const express = require('express');
const axios = require('axios');
const router = express.Router();

const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Enhanced Google Places API call to get detailed information
const getPlaceDetails = async (placeId) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json`,
      {
        params: {
          place_id: placeId,
          fields: 'name,formatted_address,formatted_phone_number,rating,user_ratings_total,opening_hours,photos,reviews,website,geometry,types',
          key: GOOGLE_MAPS_KEY
        }
      }
    );

    if (response.data.status === 'OK' && response.data.result) {
      return response.data.result;
    }
  } catch (error) {
    console.error('Error fetching place details:', error.message);
  }
  return null;
};

// Enhanced mock data with more comprehensive information
const getMockDoctors = (lat, lng, specialty) => {
  const isHospital = specialty?.toLowerCase().includes('hospital');

  return [
    {
      id: 'mock1',
      place_id: 'mock1_place_id',
      name: isHospital ? `${specialty || 'City'} General Hospital` : `${specialty || 'General'} Medical Clinic`,
      address: '123 Medical Center Drive, City, State 12345',
      rating: 4.5,
      user_ratings_total: 128,
      open_now: true,
      location: { lat: parseFloat(lat) + 0.01, lng: parseFloat(lng) + 0.01 },
      types: isHospital ? ['hospital', 'medical', 'emergency'] : ['doctor', 'health', 'medical'],
      phone: '+1-234-567-8900',
      distance: '1.2',
      photo_reference: isHospital ? 'mock_hospital_photo_1' : null,
      website: 'https://example-hospital.com',
      reviews: [
        { text: 'Excellent care and professional staff', rating: 5, author_name: 'John D.' },
        { text: 'Clean facility and short wait times', rating: 4, author_name: 'Sarah M.' }
      ],
      opening_hours: {
        open_now: true,
        periods: [
          { open: { day: 1, time: '0800' }, close: { day: 1, time: '2000' } },
          { open: { day: 2, time: '0800' }, close: { day: 2, time: '2000' } }
        ]
      },
      price_level: 2,
      wheelchair_accessible: true,
      services: isHospital ? ['Emergency Room', 'Surgery', 'Maternity', 'ICU'] : ['General Practice', 'Preventive Care', 'Vaccinations'],
      specialties: isHospital ? [] : [specialty || 'General Medicine'],
      established_year: isHospital ? 1985 : 2001,
      beds: isHospital ? 250 : null,
      doctors_count: isHospital ? 45 : 8,
      maps_link: `https://www.google.com/maps/search/?api=1&query=${isHospital ? 'hospital' : 'medical+clinic'}+near+${lat},${lng}`,
      directions_link: `https://www.google.com/maps/dir/?api=1&destination=${parseFloat(lat) + 0.01},${parseFloat(lng) + 0.01}`
    },
    {
      id: 'mock2',
      place_id: 'mock2_place_id',
      name: isHospital ? 'Regional Medical Center' : 'Specialist Care Clinic',
      address: '456 Healthcare Boulevard, City, State 12345',
      rating: 4.2,
      user_ratings_total: 89,
      open_now: true,
      location: { lat: parseFloat(lat) - 0.01, lng: parseFloat(lng) + 0.01 },
      types: isHospital ? ['hospital', 'medical'] : ['clinic', 'health'],
      phone: '+1-234-567-8901',
      distance: '2.1',
      photo_reference: isHospital ? 'mock_hospital_photo_2' : null,
      website: 'https://regional-medical.com',
      reviews: [
        { text: 'Good doctors but can be busy', rating: 4, author_name: 'Mike R.' },
        { text: 'Modern equipment and facilities', rating: 5, author_name: 'Lisa K.' }
      ],
      opening_hours: {
        open_now: true,
        periods: [
          { open: { day: 1, time: '0700' }, close: { day: 1, time: '2100' } }
        ]
      },
      price_level: 3,
      wheelchair_accessible: true,
      services: isHospital ? ['Cardiology', 'Orthopedics', 'Pediatrics'] : ['Specialist Consultation', 'Diagnostic Tests'],
      specialties: isHospital ? [] : [specialty || 'Internal Medicine'],
      established_year: isHospital ? 1992 : 2010,
      beds: isHospital ? 180 : null,
      doctors_count: isHospital ? 32 : 5,
      maps_link: `https://www.google.com/maps/search/?api=1&query=${isHospital ? 'medical+center' : 'clinic'}+near+${lat},${lng}`,
      directions_link: `https://www.google.com/maps/dir/?api=1&destination=${parseFloat(lat) - 0.01},${parseFloat(lng) + 0.01}`
    },
    {
      id: 'mock3',
      place_id: 'mock3_place_id',
      name: isHospital ? 'Community General Hospital' : 'Urgent Care Center',
      address: '789 Emergency Lane, City, State 12345',
      rating: 4.7,
      user_ratings_total: 256,
      open_now: true,
      location: { lat: parseFloat(lat) + 0.005, lng: parseFloat(lng) - 0.01 },
      types: isHospital ? ['hospital', 'emergency'] : ['urgent_care', 'health'],
      phone: '+1-234-567-8902',
      distance: '3.5',
      photo_reference: isHospital ? 'mock_hospital_photo_3' : null,
      website: 'https://community-hospital.org',
      reviews: [
        { text: 'Life-saving emergency care', rating: 5, author_name: 'Emergency Patient' },
        { text: 'Amazing staff and quick service', rating: 5, author_name: 'Tom W.' }
      ],
      opening_hours: {
        open_now: true,
        periods: [
          { open: { day: 0, time: '0000' }, close: { day: 6, time: '2359' } }
        ]
      },
      price_level: 2,
      wheelchair_accessible: true,
      services: isHospital ? ['24/7 Emergency', 'Trauma Center', 'Ambulance Service'] : ['Walk-in Care', 'Minor Surgery', 'X-rays'],
      specialties: isHospital ? [] : ['Emergency Medicine', 'Urgent Care'],
      established_year: isHospital ? 1978 : 2015,
      beds: isHospital ? 320 : null,
      doctors_count: isHospital ? 58 : 12,
      maps_link: `https://www.google.com/maps/search/?api=1&query=${isHospital ? 'emergency+hospital' : 'urgent+care'}+near+${lat},${lng}`,
      directions_link: `https://www.google.com/maps/dir/?api=1&destination=${parseFloat(lat) + 0.005},${parseFloat(lng) - 0.01}`
    },
    {
      id: 'mock4',
      place_id: 'mock4_place_id',
      name: isHospital ? 'St. Mary\'s Hospital' : 'Family Health Center',
      address: '321 Wellness Street, City, State 12345',
      rating: 4.6,
      user_ratings_total: 167,
      open_now: false,
      location: { lat: parseFloat(lat) + 0.015, lng: parseFloat(lng) + 0.005 },
      types: isHospital ? ['hospital'] : ['clinic', 'family_medicine'],
      phone: '+1-234-567-8903',
      distance: '4.8',
      photo_reference: isHospital ? 'mock_hospital_photo_4' : null,
      website: 'https://stmarys-hospital.com',
      reviews: [
        { text: 'Compassionate care for the whole family', rating: 5, author_name: 'Mary S.' }
      ],
      opening_hours: {
        open_now: false,
        periods: [
          { open: { day: 1, time: '0900' }, close: { day: 1, time: '1700' } }
        ]
      },
      price_level: 2,
      wheelchair_accessible: true,
      services: isHospital ? ['Maternity', 'Pediatrics', 'Surgery'] : ['Family Medicine', 'Pediatrics', 'Women\'s Health'],
      specialties: isHospital ? [] : ['Family Medicine'],
      established_year: isHospital ? 1965 : 2008,
      beds: isHospital ? 200 : null,
      doctors_count: isHospital ? 28 : 6,
      maps_link: `https://www.google.com/maps/search/?api=1&query=${isHospital ? 'st+marys+hospital' : 'family+health+center'}+near+${lat},${lng}`,
      directions_link: `https://www.google.com/maps/dir/?api=1&destination=${parseFloat(lat) + 0.015},${parseFloat(lng) + 0.005}`
    },
    {
      id: 'mock5',
      place_id: 'mock5_place_id',
      name: isHospital ? 'Memorial Hospital' : 'Dental Care Center',
      address: '555 Memory Lane, City, State 12345',
      rating: 4.3,
      user_ratings_total: 94,
      open_now: true,
      location: { lat: parseFloat(lat) - 0.008, lng: parseFloat(lng) - 0.012 },
      types: isHospital ? ['hospital'] : ['dentist', 'health'],
      phone: '+1-234-567-8904',
      distance: '5.2',
      photo_reference: isHospital ? 'mock_hospital_photo_5' : null,
      website: 'https://memorial-hospital.net',
      reviews: [
        { text: 'Good facilities and caring staff', rating: 4, author_name: 'Robert J.' }
      ],
      opening_hours: {
        open_now: true,
        periods: [
          { open: { day: 1, time: '0800' }, close: { day: 1, time: '1800' } }
        ]
      },
      price_level: 2,
      wheelchair_accessible: true,
      services: isHospital ? ['Oncology', 'Rehabilitation', 'Mental Health'] : ['General Dentistry', 'Orthodontics', 'Oral Surgery'],
      specialties: isHospital ? [] : ['Dentistry'],
      established_year: isHospital ? 1988 : 2012,
      beds: isHospital ? 150 : null,
      doctors_count: isHospital ? 22 : 4,
      maps_link: `https://www.google.com/maps/search/?api=1&query=${isHospital ? 'memorial+hospital' : 'dental+care+center'}+near+${lat},${lng}`,
      directions_link: `https://www.google.com/maps/dir/?api=1&destination=${parseFloat(lat) - 0.008},${parseFloat(lng) - 0.012}`
    }
  ];
};

// Calculate distance between two coordinates in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d.toFixed(1);
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// @route   GET /api/doctors
// @desc    Search for doctors/medical facilities using Google Places API
router.get('/', async (req, res) => {
  try {
    const { query: queryParam, lat, lng, radius = 25000 } = req.query;

    if (!queryParam && (!lat || !lng)) {
      return res.status(400).json({ message: 'Search query or location (lat/lng) is required' });
    }

    // If no Google Maps API key, return mock data
    if (!GOOGLE_MAPS_KEY || GOOGLE_MAPS_KEY === 'your_google_maps_api_key_here') {
      const mockDoctors = getMockDoctors(lat || 17.6868, lng || 83.2185, queryParam);
      return res.json({ doctors: mockDoctors, count: mockDoctors.length, usingMockData: true });
    }

    // Refine search query
    let searchQuery = queryParam || 'doctor';

    // Auto-detect if "hospital" or "clinic" or "pharmacy" is needed if query is generic
    const lowerQuery = searchQuery.toLowerCase();
    const commonMedical = ['doctor', 'clinic', 'hospital', 'specialist', 'treatment', 'medical', 'pharmacy', 'dentist'];
    const hasMedical = commonMedical.some(k => lowerQuery.includes(k));

    if (!hasMedical && !lowerQuery.includes('in ')) {
      searchQuery = `${searchQuery} medical center`;
    }

    const searchParams = {
      query: searchQuery,
      key: GOOGLE_MAPS_KEY
    };

    // If we have lat/lng and query is not location-specific (no "in city"), use location bias
    if (lat && lng && !lowerQuery.includes('in ')) {
      searchParams.location = `${lat},${lng}`;
      searchParams.radius = radius;
    }

    console.log(`[DoctorsAPI] Searching: "${searchQuery}" (lat:${lat}, lng:${lng})`);

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/textsearch/json`,
      { params: searchParams }
    );

    if (response.data.status !== 'OK' || !response.data.results || response.data.results.length === 0) {
      console.log(`[DoctorsAPI] Google API returned ${response.data.status}. Falling back to mocks.`);
      const mockDoctors = getMockDoctors(lat || 17.6868, lng || 83.2185, queryParam);
      return res.json({ doctors: mockDoctors, count: mockDoctors.length, usingMockData: true });
    }

    const doctorsPromise = response.data.results.slice(0, 15).map(async (place) => {
      // Calculate distance if we have user coords
      let distanceValue = 'N/A';
      if (lat && lng && place.geometry?.location) {
        distanceValue = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          place.geometry.location.lat,
          place.geometry.location.lng
        );
      }

      // Photos
      let imageUrl = null;
      if (place.photos && place.photos.length > 0) {
        imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_MAPS_KEY}`;
      }

      // Fetch details for phone, hours, website
      const details = await getPlaceDetails(place.place_id);

      return {
        id: place.place_id,
        name: place.name,
        address: place.formatted_address || place.vicinity,
        rating: place.rating || 0,
        user_ratings_total: place.user_ratings_total || 0,
        location: place.geometry?.location || null,
        types: place.types || [],
        distance: distanceValue,
        photo: imageUrl,
        phone: details?.formatted_phone_number || null,
        website: details?.website || null,
        opening_hours: details?.opening_hours || place.opening_hours || null,
        open_now: details?.opening_hours ? details.opening_hours.open_now : (place.opening_hours ? place.opening_hours.open_now : null),
        maps_link: `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${place.place_id}`,
        directions_link: `https://www.google.com/maps/dir/?api=1&destination=${place.geometry?.location?.lat},${place.geometry?.location?.lng}`
      };
    });

    const detailedDoctors = await Promise.all(doctorsPromise);

    res.json({
      doctors: detailedDoctors,
      count: detailedDoctors.length,
      usingMockData: false
    });
  } catch (error) {
    console.error('[DoctorsAPI] Error:', error.message);
    res.status(500).json({ message: 'Error fetching medical places' });
  }
});

// @route   GET /api/doctors/hospitals
// @desc    Search for hospitals nearby
router.get('/hospitals', async (req, res) => {
  try {
    const { lat, lng, specialty, radius = 27000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and Longitude are required' });
    }

    // If no Google Maps API key, return mock data
    if (!GOOGLE_MAPS_KEY || GOOGLE_MAPS_KEY === 'your_google_maps_api_key_here') {
      console.log('Google Maps API key not configured, returning mock hospital data');
      const mockHospitals = getMockDoctors(lat, lng, 'Hospital');
      return res.json({
        hospitals: mockHospitals,
        count: mockHospitals.length,
        usingMockData: true
      });
    }

    const query = specialty ? `${specialty} hospital` : 'hospital';

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/textsearch/json`,
      {
        params: {
          query: query,
          location: `${lat},${lng}`,
          radius: radius,
          key: GOOGLE_MAPS_KEY
        }
      }
    );

    // If Google API fails, fallback to mock data
    if (response.data.status !== 'OK' || !response.data.results || response.data.results.length === 0) {
      console.log('Google API returned no results or error, using mock hospital data');
      const mockHospitals = getMockDoctors(lat, lng, 'Hospital');
      return res.json({
        hospitals: mockHospitals,
        count: mockHospitals.length,
        usingMockData: true,
        googleApiStatus: response.data.status
      });
    }

    const hospitals = response.data.results.slice(0, 10).map(async (place) => {
      const distance = calculateDistance(
        parseFloat(lat),
        parseFloat(lng),
        place.geometry.location.lat,
        place.geometry.location.lng
      );

      const details = await getPlaceDetails(place.place_id);

      return {
        id: place.place_id,
        place_id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        rating: place.rating || 0,
        user_ratings_total: place.user_ratings_total || 0,
        open_now: place.opening_hours ? place.opening_hours.open_now : null,
        location: place.geometry.location,
        types: place.types,
        phone: details?.formatted_phone_number || null,
        distance: distance,
        photo_reference: details?.photos?.[0]?.photo_reference || place.photos?.[0]?.photo_reference || null,
        website: details?.website || null,
        reviews: details?.reviews?.slice(0, 2) || [],
        opening_hours: details?.opening_hours || place.opening_hours,
        price_level: details?.price_level || null,
        wheelchair_accessible: details?.wheelchair_accessible || false,
        services: [],
        maps_link: `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${place.place_id}`,
        directions_link: `https://www.google.com/maps/dir/?api=1&destination=${place.geometry.location.lat},${place.geometry.location.lng}`
      };
    });

    const detailedHospitals = await Promise.all(hospitals);

    res.json({
      hospitals: detailedHospitals,
      count: detailedHospitals.length,
      usingMockData: false
    });
  } catch (error) {
    console.error('Google Places API error:', error.message);

    // Fallback to mock data on any error
    const { lat, lng } = req.query;
    if (lat && lng) {
      const mockHospitals = getMockDoctors(lat, lng, 'Hospital');
      return res.json({
        hospitals: mockHospitals,
        count: mockHospitals.length,
        usingMockData: true,
        error: 'Google Maps API unavailable, showing sample data'
      });
    }

    res.status(500).json({ message: 'Error fetching hospitals from Google Maps' });
  }
});

module.exports = router;
