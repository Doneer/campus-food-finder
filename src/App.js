import React, { useState, useEffect } from 'react';
import { MapPin, Filter, Star, Plus, X, Heart, Settings } from 'lucide-react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { AuthProvider, useAuth } from './AuthContext';
import { LoginForm, RegisterForm, UserProfile } from './AuthComponents';
import { NotificationSystem } from './NotificationComponents';
import { AdminPanel } from './AdminComponents';
import { GoogleSheetsAPI } from './GoogleSheetsAPI';

const CampusFoodFinder = () => {
  const { user, updatePreferences, toggleFavorite } = useAuth();
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState({
    priceRange: 'all',
    dietary: 'all',
    mealTime: 'all'
  });
  const [showAllDiscounts, setShowAllDiscounts] = useState(false); 
  const [activeTab, setActiveTab] = useState('map');
  const [showModal, setShowModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [modalType, setModalType] = useState('location');
  
  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };
  
  const center = {
    lat: 51.7472620296469, 
    lng: 19.453302755355534  
  };

  useEffect(() => {
	  const loadAllLocations = async () => {
		const sampleLocations = [
		  {
			id: 1,
			name: "Restauracja Politechnika",
			type: "campus",
			priceRange: "low",
			dietary: ["vegetarian", "vegan", "gluten-free"],
			mealTimes: ["breakfast", "lunch", "dinner"],
			description: "Main campus cafeteria with daily specials and budget-friendly options.",
			address: "Aleje Politechniki 8, Building B9",
			rating: 4.2,
			discount: "20% off with student ID",
			nutritionHighlights: ["High protein options", "Fresh salads daily"],
			imageUrl: "/api/placeholder/400/300",
			topDish: "Vegetable Curry - 8 PLN",
			coordinates: {
			  lat: 51.74717066396719, 
			  lng: 19.453707281086025 
			}
		  },
		  {
			id: 2,
			name: "GIÀ pasta bar",
			type: "local",
			priceRange: "medium",
			dietary: ["vegetarian", "vegan"],
			mealTimes: ["lunch", "dinner"],
			description: "Vegetarian and vegan cafe with fresh juices and smoothies.",
			address: "Aleje Politechniki 1 (Nowa Sukcesja), 5 min from campus",
			rating: 4.7,
			discount: "Free drink with meal purchase",
			nutritionHighlights: ["Organic ingredients", "No added sugars"],
			imageUrl: "/api/placeholder/400/300",
			topDish: "Buddha Bowl - 15 PLN",
			coordinates: {
			  lat: 51.749699474686125, 
			  lng: 19.449647520572903
			}
		  },
		  {
			id: 3,
			name: "Bar Ha Long",
			type: "local",
			priceRange: "low",
			dietary: ["halal"],
			mealTimes: ["breakfast", "lunch"],
			description: "Quick and affordable snacks and light meals near Campus A.",
			address: "Radwanska Str 30",
			rating: 3.9,
			discount: "10% off during exam weeks",
			nutritionHighlights: ["Whole grain options", "Fresh fruit available"],
			imageUrl: "/api/placeholder/400/300",
			topDish: "Indian Chicken - 10 PLN",
			coordinates: {
			  lat: 51.752068082781435, 
			  lng: 19.451446114697674
			}
		  },
		  {
			id: 4,
			name: "Serenissima Poland Sp. o.o.",
			type: "campus",
			priceRange: "medium",
			dietary: ["vegetarian", "gluten-free"],
			mealTimes: ["lunch", "dinner"],
			description: "Popular student hangout with comfort food and study-friendly environment.",
			address: "Aleje Politechniki 3a, Building C15",
			rating: 4.0,
			discount: "Student loyalty card: buy 9 meals, get 1 free",
			nutritionHighlights: ["Balanced meals", "Local ingredients"],
			imageUrl: "/api/placeholder/400/300",
			topDish: "Quinoa Bowl - 12 PLN",
			coordinates: {
			  lat: 51.749031438753164,
			  lng: 19.449498397401925
			}
		  },
		  {
			id: 5,
			name: "Zatoka Smaku",
			type: "campus",
			priceRange: "low",
			dietary: ["halal", "vegetarian"],
			mealTimes: ["breakfast", "lunch", "dinner"],
			description: "Fast-casual spot with diverse options under 10 PLN.",
			address: "Zatoka Sportu Politechniki Łódzkiej, Floor 1",
			rating: 3.7,
			discount: "Breakfast special: 5 PLN before 10am",
			nutritionHighlights: ["Portion control options", "Low-sodium selections"],
			imageUrl: "/api/placeholder/400/300",
			topDish: "Falafel Sandwich - 9 PLN",
			coordinates: {
			  lat: 51.74623336992477, 
			  lng: 19.45187898413258
			}
		  },
		];
		
		try {
		  console.log('Loading approved locations from Google Sheets...');
		  const approvedLocations = await GoogleSheetsAPI.getApprovedLocations();
		  console.log('Loaded approved locations:', approvedLocations);
		  
		  const maxSampleId = Math.max(...sampleLocations.map(loc => loc.id));
		  const processedApprovedLocations = approvedLocations.map(loc => ({
			...loc,
			id: loc.id > maxSampleId ? loc.id : maxSampleId + loc.id // Ensure unique IDs
		  }));
		  
		  const allLocations = [...sampleLocations, ...processedApprovedLocations];
		  console.log('Total locations loaded:', allLocations.length);
		  setLocations(allLocations);
		} catch (error) {
		  console.error('Error loading approved locations:', error);
		  console.log('Using only sample locations');
		  setLocations(sampleLocations);
		}
	  };
	  
	  loadAllLocations();
	}, []);
	
	useEffect(() => {
	  console.log('=== Setting up newLocationApproved listener ===');
	  
	  const handleNewLocationApproved = (event) => {
		console.log('=== newLocationApproved event received ===');
		console.log('Event:', event);
		console.log('Event detail:', event.detail);
		
		const newLocation = event.detail;
		
		if (!newLocation) {
		  console.error('No location data in event');
		  return;
		}
		
		console.log('New location to add:', newLocation);
		
		setLocations(prevLocations => {
		  const exists = prevLocations.some(loc => loc.id === newLocation.id || loc.name === newLocation.name);
		  if (exists) {
			console.log('Location already exists, skipping...');
			return prevLocations;
		  }
		  
		  console.log('Previous locations count:', prevLocations.length);
		  const updatedLocations = [...prevLocations, newLocation];
		  console.log('Updated locations count:', updatedLocations.length);
		  return updatedLocations;
		});
		
		alert(`✅ ${newLocation.name} has been approved and added to the locations!`);
	  };

	  window.addEventListener('newLocationApproved', handleNewLocationApproved);
	  console.log('Event listener added successfully');

	  return () => {
		console.log('Removing newLocationApproved listener');
		window.removeEventListener('newLocationApproved', handleNewLocationApproved);
	  };
	}, []);

	const filteredLocations = locations.filter(location => {
	  if (filters.priceRange !== 'all' && location.priceRange !== filters.priceRange) {
		return false;
	  }
	  
	  if (filters.dietary !== 'all' && !location.dietary.includes(filters.dietary)) {
		return false;
	  }
	  
	  if (filters.mealTime !== 'all' && !location.mealTimes.includes(filters.mealTime)) {
		return false;
	  }
	  
	  if (user && user.preferences && !showAllDiscounts) {
		if (filters.priceRange === 'all' && user.preferences.priceRange !== 'all') {
		  if (location.priceRange !== user.preferences.priceRange) {
			return false;
		  }
		}
		
		if (filters.dietary === 'all' && user.preferences.dietary && user.preferences.dietary.length > 0) {
		  const hasMatchingDietary = user.preferences.dietary.some(diet => 
			location.dietary.includes(diet)
		  );
		  if (!hasMatchingDietary) {
			return false;
		  }
		}
	  }
	  
	  return true;
	});

  const openLocationDetail = (location) => {
	  setSelectedLocation(location);
	  setModalType('location');
	  setShowModal(true);
	};
  
  const closeModal = () => {
    setShowModal(false);
    setSelectedLocation(null);
	setModalType('location');
  };
  
  useEffect(() => {
   window.closeModal = closeModal;
    return () => {
      window.closeModal = null;
    };
  }, []);
  
  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
    if (value !== 'all') {
      setShowAllDiscounts(false);
    }
  };

  const openSubmissionForm = () => {
    const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSe_M5wdm4E1_pEN4SNScpa3TMKuxaek90WikQd_9fycv7MHrQ/viewform?usp=dialog";
	window.open(formUrl, "_blank");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
		<header className="bg-blue-600 text-white p-4 shadow-md">
		  <div className="container mx-auto flex justify-between items-center">
			<div className="flex items-center space-x-2">
			  <MapPin size={24} />
			  <h1 className="text-xl font-bold">Campus Food Finder</h1>
			</div>
			<div className="flex items-center space-x-4">
			  {user ? (
				<>
				  <NotificationSystem />
				  <span className="text-sm">Welcome, {user.name}</span>
				  <button 
					onClick={() => {
					  setModalType('profile');
					  setShowModal(true);
					}}
					className="bg-white text-blue-600 font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors flex items-center"
				  >
					<Settings size={16} className="mr-1" />
					Profile
				  </button>
				</>
			  ) : (
				<div className="space-x-2">
				  <button 
					onClick={() => {
					  setModalType('login');
					  setShowModal(true);
					}}
					className="bg-white text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-50"
				  >
					Login
				  </button>
				  <button 
					onClick={() => {
					  setModalType('register');
					  setShowModal(true);
					}}
					className="bg-blue-700 text-white px-3 py-1 rounded-lg hover:bg-blue-800"
				  >
					Register
				  </button>
				</div>
			  )}
			  <button 
				onClick={openSubmissionForm} 
				className="bg-white text-blue-600 font-medium px-4 py-2 rounded-lg flex items-center space-x-1 hover:bg-blue-50 transition-colors"
			  >
				<Plus size={18} />
				<span>Add Location</span>
			  </button>
			</div>
		  </div>
		</header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4">
        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'map' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('map')}
          >
            Map View
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'list' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('list')}
          >
            List View
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'discount' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('discount')}
          >
            Student Discounts
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <div className="flex items-center space-x-1 mb-2">
            <Filter size={16} className="text-blue-600" />
            <h2 className="font-medium">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Price Range Filter */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Price Range</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
              >
                <option value="all">All Prices</option>
                <option value="low">Budget (Under 10 PLN)</option>
                <option value="medium">Mid-Range (10-15 PLN)</option>
                <option value="high">Premium (15+ PLN)</option>
              </select>
            </div>
            
            {/* Dietary Filter */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Dietary Options</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={filters.dietary}
                onChange={(e) => handleFilterChange('dietary', e.target.value)}
              >
                <option value="all">All Options</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="gluten-free">Gluten-Free</option>
                <option value="halal">Halal</option>
              </select>
            </div>
            
            {/* Meal Time Filter */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Meal Time</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={filters.mealTime}
                onChange={(e) => handleFilterChange('mealTime', e.target.value)}
              >
                <option value="all">Any Time</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>
          </div>
        </div>

        {/* Map View */}
        <div className={`bg-white p-4 rounded-lg shadow-sm ${activeTab === 'map' ? 'block' : 'hidden'}`}>
          <div className="text-center mb-4 text-gray-700">
            <p className="mb-2">Campus Food Finder Map</p>
            <p className="text-sm text-gray-500">
              Explore affordable and nutritious food options near Lodz University of Technology.
			  Click on markers to see details about each location.
            </p>
          </div>
          {/* Real Google Maps container */}
		  <div className="mb-4 h-64" style={{ height: "400px" }}>
			<LoadScript googleMapsApiKey="AIzaSyAoyyD3kvahuQlz35-5ny91RV4Xw0S65-k">
			  <GoogleMap
				mapContainerStyle={mapContainerStyle}
				center={center}
				zoom={14}
				options={{
				  disableDefaultUI: false,
				  zoomControl: true,
				  mapTypeControl: true,
				  streetViewControl: false,
				  fullscreenControl: true,
				}}
			  >
				{/* Add markers for each location */}
				{filteredLocations.map(location => (
				  <Marker
					key={location.id}
					position={location.coordinates}
					onClick={() => openLocationDetail(location)}
				  />
				))}
			  </GoogleMap>
			</LoadScript>
		  </div>
          
          {/* Location cards below map */}
          <h3 className="font-medium mb-2">Nearby Locations ({filteredLocations.length})</h3>
          
          {filteredLocations.length === 0 ? (
            // No locations message for map view
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-2">
                <span className="text-4xl" role="img" aria-label="sad face">😔</span>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No locations match your preferences</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your filters above or updating your preferences in your profile.
              </p>
              <button
                onClick={() => {
                  setFilters({
                    priceRange: 'all',
                    dietary: 'all',
                    mealTime: 'all'
                  });
                  setShowAllDiscounts(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Show All Locations
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLocations.map(location => (
                <div 
                  key={location.id} 
                  className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openLocationDetail(location)}
                >
                <div className="p-3 border-b">
				  <div className="flex justify-between items-start">
					<div>
					  <h3 className="font-medium">{location.name}</h3>
					  <p className="text-sm text-gray-500">{location.address}</p>
					</div>
					<div className="flex flex-col items-end space-y-2">
					  <div className="flex items-center bg-blue-50 px-2 py-1 rounded text-sm">
						<Star size={14} className="text-yellow-500 mr-1" />
						<span>{location.rating}</span>
					  </div>
					  {/* Heart button moved here */}
					  {user && (
						<button
						  onClick={(e) => {
							e.stopPropagation();
							toggleFavorite(location.id);
						  }}
						  className={`p-1 rounded-full ${
							user.favoriteLocations?.includes(location.id)
							  ? 'text-red-500 bg-white shadow-md'
							  : 'text-gray-400 bg-white shadow-md'
						  }`}
						>
						  <Heart 
							size={16} 
							fill={user.favoriteLocations?.includes(location.id) ? 'currentColor' : 'none'}
						  />
						</button>
					  )}
					</div>
				  </div>
					
                    <div className="flex mt-2 flex-wrap gap-1">
                      {location.priceRange === 'low' && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Budget</span>
                      )}
					  {location.priceRange === 'medium' && (
						<span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">Mid-Range</span>
					  )}
					  {location.priceRange === 'high' && (
						<span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">Premium</span>
					  )}
                      {location.dietary.includes('vegetarian') && (
                        <span className="bg-green-50 text-green-600 text-xs px-2 py-1 rounded">Vegetarian</span>
                      )}
                      {location.dietary.includes('vegan') && (
                        <span className="bg-green-50 text-green-600 text-xs px-2 py-1 rounded">Vegan</span>
                      )}
					  {location.dietary.includes('halal') && (
						<span className="bg-purple-50 text-purple-600 text-xs px-2 py-1 rounded">Halal</span>
					  )}
					  {location.dietary.includes('gluten-free') && (
						<span className="bg-orange-50 text-orange-600 text-xs px-2 py-1 rounded">Gluten-Free</span>
					  )}
                      {location.discount && (
                        <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded flex items-center">
                          <span className="mr-1" role="img" aria-label="graduation cap">🎓</span> Discount
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-medium">Top Pick: {location.topDish}</div>
                    <div className="text-xs text-blue-600 mt-1">{location.discount}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* List View */}
        <div className={`bg-white rounded-lg shadow-sm ${activeTab === 'list' ? 'block' : 'hidden'}`}>
		  <div className="p-4 border-b">
			<h2 className="font-medium">All Locations ({filteredLocations.length})</h2>
		  </div>
		  
		  {filteredLocations.length === 0 ? (
			// No locations message for list view
			<div className="p-8 text-center">
			  <div className="text-gray-400 mb-2">
				<span className="text-4xl" role="img" aria-label="sad face">😔</span>
			  </div>
			  <h3 className="text-lg font-medium text-gray-700 mb-2">No locations match your preferences</h3>
			  <p className="text-gray-500 mb-4">
				Try adjusting your filters above or updating your preferences in your profile.
			  </p>
			  <button
				onClick={() => {
				  setFilters({
					priceRange: 'all',
					dietary: 'all',
					mealTime: 'all'
				  });
				  setShowAllDiscounts(true);
				}}
				className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
			  >
				Show All Locations
			  </button>
			</div>
		  ) : (
			<div className="divide-y">
			  {filteredLocations.map(location => (
				<div 
				  key={location.id} 
				  className="p-4 hover:bg-gray-50 cursor-pointer"
				  onClick={() => openLocationDetail(location)}
				>
				  <div className="flex justify-between">
					<div>
					  <h3 className="font-medium">{location.name}</h3>
					  <p className="text-sm text-gray-500">{location.address}</p>
					  <div className="flex mt-1 flex-wrap gap-1">
						{location.priceRange === 'low' && (
						  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Budget</span>
						)}
						{location.priceRange === 'medium' && (
						  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">Mid-Range</span>
						)}
						{location.priceRange === 'high' && (
						  <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">Premium</span>
						)}
						{location.dietary.map(diet => (
						  <span 
							key={diet} 
							className={`text-xs px-2 py-1 rounded ${
							  diet === 'vegetarian' ? 'bg-green-50 text-green-600' :
							  diet === 'vegan' ? 'bg-green-50 text-green-600' :
							  diet === 'halal' ? 'bg-purple-50 text-purple-600' :
							  diet === 'gluten-free' ? 'bg-orange-50 text-orange-600' :
							  'bg-blue-50 text-blue-600'
							}`}
						  >
							{diet.charAt(0).toUpperCase() + diet.slice(1).replace('-', ' ')}
						  </span>
						))}
					  </div>
					</div>
					<div className="flex flex-col items-end">
					  <div className="flex items-center bg-blue-50 px-2 py-1 rounded text-sm mb-2">
						<Star size={14} className="text-yellow-500 mr-1" />
						<span>{location.rating}</span>
					  </div>
					  <div className="text-sm font-medium">{location.topDish}</div>
					</div>
				  </div>
				  <div className="mt-2">
					<p className="text-sm">{location.description}</p>
					{location.discount && (
					  <p className="text-sm text-blue-600 mt-1">
						<span className="font-medium">Student Discount:</span> {location.discount}
					  </p>
					)}
				  </div>
				</div>
			  ))}
			</div>
		  )}
		</div>

        {/* Discounts View */}
        <div className={`bg-white rounded-lg shadow-sm ${activeTab === 'discount' ? 'block' : 'hidden'}`}>
          <div className="p-4 border-b">
            <h2 className="font-medium">Student Discounts</h2>
            <p className="text-sm text-gray-500 mt-1">Special offers for students with valid ID</p>
            {user && user.preferences && !showAllDiscounts && (
              <p className="text-xs text-blue-600 mt-2">
                Showing discounts matching your preferences: {
                  user.preferences.priceRange !== 'all' 
                    ? (user.preferences.priceRange === 'low' ? 'budget' : 
                       user.preferences.priceRange === 'medium' ? 'mid-range' : 'premium')
                    : 'all prices'
                }, {user.preferences.dietary && user.preferences.dietary.length > 0 ? user.preferences.dietary.join(', ') : 'all dietary options'}
              </p>
            )}
          </div>
          <div className="divide-y">
            {filteredLocations
              .filter(location => location.discount) // Only locations with discounts
              .map(location => (
                <div 
                  key={location.id} 
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => openLocationDetail(location)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{location.name}</h3>
                      <p className="text-sm text-gray-500">{location.address}</p>
                    </div>
                    <div className="flex items-center bg-blue-50 px-2 py-1 rounded text-sm">
                      <Star size={14} className="text-yellow-500 mr-1" />
                      <span>{location.rating}</span>
                    </div>
                  </div>
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-start">
                      <span className="text-2xl mr-2" role="img" aria-label="graduation cap">🎓</span>
                      <div>
                        <p className="font-medium text-blue-700">{location.discount}</p>
                        <p className="text-sm text-blue-600 mt-1">Show your student ID to redeem</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Show why this discount matches user preferences */}
                  {user && user.preferences && !showAllDiscounts && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {/* Price range match */}
                      {user.preferences.priceRange !== 'all' && location.priceRange === user.preferences.priceRange && (
                        <span className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded border border-green-200">
                          Matches your price preference
                        </span>
                      )}
                      
                      {/* Dietary matches */}
                      {user.preferences.dietary && user.preferences.dietary.length > 0 && 
                       user.preferences.dietary.some(diet => location.dietary.includes(diet)) && (
                        <span className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded border border-purple-200">
                          Matches your dietary preferences
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            
            {/* Show message if no discounts match preferences */}
            {filteredLocations.filter(location => location.discount).length === 0 && (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-2">
                  <span className="text-4xl" role="img" aria-label="sad face">😔</span>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No discounts match your preferences</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your filters above or updating your preferences in your profile.
                </p>
                <button
                  onClick={() => {
                    setFilters({
                      priceRange: 'all',
                      dietary: 'all',
                      mealTime: 'all'
                    });
                    setShowAllDiscounts(true); // Override user preferences
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Show All Discounts
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* About/QR Code Section */}
      <section className="bg-gray-100 py-6">
        <div className="container mx-auto px-4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">About Campus Food Finder</h2>
            <p className="mb-4">
              Campus Food Finder helps university students find affordable, nutritious food options on and near campus. 
              Our platform addresses key challenges identified in our research:
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>Budget constraints that lead to poor food choices</li>
              <li>Lack of centralized information about affordable, healthy options</li>
              <li>Time poverty that affects meal preparation and planning</li>
            </ul>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="font-medium mb-2">Scan our QR Code</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Save this page to your phone by scanning this QR code. Share with your friends!
                </p>
                <div className="bg-gray-100 w-32 h-32 flex items-center justify-center rounded-lg border overflow-hidden">
				  <img 
					src={process.env.PUBLIC_URL + '/qr-code.png'} 
					alt="Campus Food Finder QR Code" 
					className="w-full h-full object-contain p-1"
				  />
				</div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Help Us Grow</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Know a great affordable place to eat? Add it to our database!
                </p>
                <button 
                  onClick={openSubmissionForm}
                  className="bg-blue-600 text-white font-medium px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
				  title="Open submission form in a new tab"
                >
                  <Plus size={18} className="mr-1" />
                  <span>Submit New Location</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
	  
	  {/* Admin Panel */}
	  <AdminPanel />

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4">
        <div className="container mx-auto text-center text-sm">
          <p>&copy; 2025 Campus Food Finder - Team Project</p>
          <p className="mt-1">Team 7 Initiative</p>
        </div>
      </footer>

      {/* Authentication and Location Detail Modals */}
		{showModal && (
		  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-screen overflow-y-auto">
			  <div className="flex justify-between items-center p-4 border-b">
				<h2 className="text-xl font-bold">
				  {modalType === 'login' && 'Login'}
				  {modalType === 'register' && 'Register'}
				  {modalType === 'profile' && 'Profile'}
				  {modalType === 'location' && selectedLocation?.name}
				</h2>
				<button 
				  onClick={closeModal}
				  className="text-gray-500 hover:text-gray-700"
				>
				  <X size={24} />
				</button>
			  </div>
			  
			  <div className="p-4">
				{modalType === 'login' && (
				  <LoginForm
					onClose={closeModal}
					onSwitchToRegister={() => setModalType('register')}
				  />
				)}
				
				{modalType === 'register' && (
				  <RegisterForm
					onClose={closeModal}
					onSwitchToLogin={() => setModalType('login')}
				  />
				)}
				
				{modalType === 'profile' && user ? (
				  <UserProfile
					user={user}
					onUpdatePreferences={(newPreferences) => {
					  updatePreferences(newPreferences);
					  setShowAllDiscounts(false); // Reset when preferences change
					}}
					onClose={closeModal}
				  />
				) : modalType === 'profile' && !user ? (
				  <div className="p-4 text-center">
					<p className="text-gray-600">Please log in to view your profile</p>
					<button
					  onClick={closeModal}
					  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg"
					>
					  Close
					</button>
				  </div>
				) : null}
				
				{modalType === 'location' && selectedLocation && (
				  <div>
					{/* Location image */}
					<div className="rounded-lg overflow-hidden h-48 bg-gray-200 mb-4">
					  <img 
						src={selectedLocation.imageUrl} 
						alt={selectedLocation.name}
						className="w-full h-full object-cover"
					  />
					</div>
					
					{/* Location details */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					  <div>
						<div className="mb-4">
						  <h3 className="font-medium text-gray-700 mb-1">Description</h3>
						  <p className="text-gray-600">{selectedLocation.description}</p>
						</div>
						
						<div className="mb-4">
						  <h3 className="font-medium text-gray-700 mb-1">Address</h3>
						  <p className="text-gray-600">{selectedLocation.address}</p>
						</div>
						
						<div className="mb-4">
						  <h3 className="font-medium text-gray-700 mb-1">Price Range</h3>
						  <p className="text-gray-600">
							{selectedLocation.priceRange === 'low' ? 'Budget-friendly (Under 10 PLN)' : 
							 selectedLocation.priceRange === 'medium' ? 'Mid-range (10-15 PLN)' : 
							 'Premium (15+ PLN)'}
						  </p>
						</div>
					  </div>
					  
					  <div>
						<div className="mb-4">
						  <h3 className="font-medium text-gray-700 mb-1">Nutrition Highlights</h3>
						  <ul className="list-disc pl-5 text-gray-600">
							{selectedLocation.nutritionHighlights.map((highlight, index) => (
							  <li key={index}>{highlight}</li>
							))}
						  </ul>
						</div>
						
						<div className="mb-4">
						  <h3 className="font-medium text-gray-700 mb-1">Dietary Options</h3>
						  <div className="flex flex-wrap gap-1">
							{selectedLocation.dietary.map(diet => (
							  <span key={diet} className="bg-green-50 text-green-600 text-xs px-2 py-1 rounded">
								{diet}
							  </span>
							))}
						  </div>
						</div>
						
						<div className="mb-4">
						  <h3 className="font-medium text-gray-700 mb-1">Available For</h3>
						  <div className="flex flex-wrap gap-1">
							{selectedLocation.mealTimes.map(time => (
							  <span key={time} className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded">
								{time.charAt(0).toUpperCase() + time.slice(1)}
							  </span>
							))}
						  </div>
						</div>
					  </div>
					</div>
					
					{/* Student Discount */}
					{selectedLocation.discount && (
					  <div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
						<div className="flex items-start">
						  <span className="text-2xl mr-2" role="img" aria-label="graduation cap">🎓</span>
						  <div>
							<h3 className="font-medium text-blue-700">Student Discount</h3>
							<p className="text-blue-600">{selectedLocation.discount}</p>
							<p className="text-sm text-blue-500 mt-1">Show your student ID to redeem</p>
						  </div>
						</div>
					  </div>
					)}
					
					{/* Top dishes */}
					<div className="mt-4">
					  <h3 className="font-medium text-gray-700 mb-2">Recommended Items</h3>
					  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
						<div className="font-medium">{selectedLocation.topDish}</div>
						<p className="text-sm text-gray-500 mt-1">Student favorite</p>
					  </div>
					</div>
					
					{/* Rating and Favorite Button */}
					<div className="mt-4 flex items-center justify-between">
					  <div className="flex items-center bg-blue-50 px-3 py-2 rounded">
						<Star size={18} className="text-yellow-500 mr-1" />
						<span className="font-medium">{selectedLocation.rating}</span>
						<span className="text-gray-500 text-sm ml-2">Student Rating</span>
					  </div>
					  
					  {user && (
						<button
						  onClick={() => toggleFavorite(selectedLocation.id)}
						  className={`flex items-center px-3 py-2 rounded-lg ${
							user.favoriteLocations?.includes(selectedLocation.id)
							  ? 'bg-red-50 text-red-600'
							  : 'bg-gray-50 text-gray-600'
						  }`}
						>
						  <Heart 
							size={18} 
							className="mr-1"
							fill={user.favoriteLocations?.includes(selectedLocation.id) ? 'currentColor' : 'none'}
						  />
						  {user.favoriteLocations?.includes(selectedLocation.id) ? 'Remove from Favorites' : 'Add to Favorites'}
						</button>
					  )}
					</div>
				  </div>
				)}
			  </div>
			  
			  <div className="p-4 border-t bg-gray-50">
				<button
				  onClick={closeModal}
				  className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors"
				>
				  Close
				</button>
			  </div>
			</div>
		  </div>
		)}
    </div>
  );
};

const AppWithAuth = () => {
  return (
    <AuthProvider>
      <CampusFoodFinder />
    </AuthProvider>
  );
};

export default AppWithAuth;