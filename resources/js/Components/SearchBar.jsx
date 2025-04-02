import { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { ChevronDown, ChevronRight } from 'lucide-react';
import axios from 'axios'; // Make sure axios is installed
import { Button } from './ui/button';
import carData from '@/Pages/cars';
import { Inertia } from '@inertiajs/inertia';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [models, setModels] = useState([]); // State to store models from the API
  const [loading, setLoading] = useState(false); // Loading state
  const [selectedModel, setSelectedModel] = useState(null); 
  const dropdownRef = useRef(null);

  // Fetch models from the API when a brand is selected
  const fetchModels = async (brandName) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/cars/models?brand=${brandName}`);
      setModels(response.data.models || []); // Store models with counts
    } catch (error) {
      console.error("Error fetching models:", error);
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter brands based on search term
  const filteredBrands = carData.data.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      if (selectedBrand && selectedModel === null) {
        // If a brand is selected and no models are available, navigate to brand's all models
        Inertia.visit(route('cars.byBodyType', { brand_name: selectedBrand.name }));
      } else if (selectedBrand && models.length > 0 && selectedModel) {
        // If a brand and a model are selected, navigate to the specific model
        Inertia.visit(route('cars.byBodyType', { 
          brand_name: selectedBrand.name, 
          model_name: selectedModel.model 
        }));
        
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  useEffect(() => {
    if (searchTerm === '') {
      // If input is cleared, reset to brand list
      setSelectedBrand(null);
      setModels([]);
      setSelectedModel(null);
    } else if (selectedBrand && searchTerm !== selectedBrand.name) {
      // If user edits the input, filter brands dynamically
      setSelectedBrand(null);
      setModels([]);
      setSelectedModel(null);
    }
  }, [searchTerm]);
  
  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    setSearchTerm(brand.name); // Display brand name in input
    setModels([]); // Reset models
    fetchModels(brand.name); // Fetch models for selected brand
    setSelectedModel(null); 
    setIsDropdownOpen(true); // Fetch models for the selected brand

  };

  const handleModelSelect = (model) => {
    if (selectedBrand) {
      setSearchTerm(`${selectedBrand.name} ${model.model}`);
      setIsDropdownOpen(false);
      setSelectedModel(model);
    }
  };

  const handleBackToMainBrands = () => {
    setSelectedBrand(null); // Reset selected brand
    setSearchTerm(''); // Reset search term
    setModels([]); // Clear models list
    setSelectedModel(null); // Reset selected model
    setIsDropdownOpen(true);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <Input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsDropdownOpen(true)}
          onKeyDown={handleKeyPress}
          className="w-full pl-4 pr-10 py-2 border rounded-l-none focus:outline-none focus:ring-0 focus:border-inherit text-gray-600"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </div>

      {isDropdownOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto">
          {selectedBrand ? (
            <div>
              <div className="flex items-center p-2 border-b border-gray-200 bg-gray-50">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mr-2 p-0 h-8 w-8"
                  onClick={handleBackToMainBrands} // Back to brand list
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </Button>
                <div className="flex items-center">
                  <div className="w-8 h-8 mr-2 relative">
                    <img
                      src={selectedBrand.image}
                      alt={selectedBrand.name}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  <span className="font-medium">{selectedBrand.name} Models</span>
                </div>
              </div>
              <div>
                {loading ? (
                <div className="p-3 text-gray-500 text-center">Loading models...</div>
              ) : models.length > 0 ? (
                <div>
                  {/* "All Models" Header */}
                  <div className="p-3 font-bold flex justify-between items-center hover:bg-gray-100 border-b cursor-pointer"
                  
                   onClick={() => Inertia.visit(route('cars.byBodyType', { brand_name: selectedBrand.name }))}
                  >
                  <span 
                  className="cursor-pointer"
                >
                  All Models
                </span>
                    {/* <span className="text-sm text-gray-600">{models.reduce((acc, model) => acc + model.count, 0)}</span> */}
                    <span className="text-sm text-gray-600">{models.length}</span>
                  </div>

                  {/* Individual Models List */}
                  {models.map((model, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                      onClick={() => {
                        setSelectedModel(model);
                        Inertia.visit(route('cars.byBodyType', { 
                          brand_name: selectedBrand.name, 
                          model_name: model.model 
                        }));
                      }}
                    >
                      <span>{model.model}</span>
                      <span className="text-sm text-gray-500">{model.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-gray-500 text-center">No models available</div>
              )}
              </div>
            </div>
          ) : (
            filteredBrands.map((brand) => (
              <div key={brand.id}>
                <div
                  className="p-3 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => handleBrandSelect(brand)}
                >
                  <div className="w-8 h-8 mr-3 relative">
                    <img
                      src={brand.image}
                      alt={brand.name}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <span>{brand.name}</span>
                  <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                </div>
              </div>
            ))
          )}

          {filteredBrands.length === 0 && !selectedBrand && (
            <div className="p-3 text-gray-500 text-center">No brands found matching "{searchTerm}"</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
