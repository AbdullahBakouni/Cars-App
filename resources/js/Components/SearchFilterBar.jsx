import { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { ChevronDown, ChevronRight } from 'lucide-react';
import axios from 'axios'; 
import { Button } from './ui/button';
import carData from '@/Pages/cars';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const SearchFilterBar = ({ setData , resetSearchTermTrigger}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [models, setModels] = useState([]); // State to store models from the API
    const [loading, setLoading] = useState(false); // Loading state
    const [selectedModel, setSelectedModel] = useState(null);
    const dropdownRef = useRef(null);
    // Fetch models from the API when a brand is selected
    useEffect(() => {
      setSearchTerm('');
      setSelectedBrand(null);
      setSelectedModel(null);
      setModels([]);
    }, [resetSearchTermTrigger]);
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
  
    const handleBrandSelect = (brand) => {
      setSelectedBrand(brand);
      setSearchTerm(brand.name); // Display brand name in input
      setModels([]); // Reset models
      fetchModels(brand.name); // Fetch models for selected brand
      setSelectedModel(null); // Reset selected model
      setIsDropdownOpen(true); // Open dropdown to choose model
  
      // Set brand_name in data (backend)
      setData('model_name', ''); // Reset model when brand is selected
  
      // Focus on the search bar
      document.querySelector('input').focus(); 
    };
  
    const handleModelSelect = (model) => {
      if (selectedBrand) {
        setSearchTerm(`${selectedBrand.name} ${model.model}`);
        setIsDropdownOpen(false);
        setSelectedModel(model);
  
        // Set model_name in data (backend)
        setData('brand_name', selectedBrand.name);
        setData('model_name', model.model);
      }
    };
  
    const handleBackToMainBrands = () => {
      setSelectedBrand(null); // Reset selected brand
      setSearchTerm(''); // Reset search term
      setModels([]); // Clear models list
      setSelectedModel(null); // Reset selected model
      setIsDropdownOpen(true); // Open dropdown to choose brand again
      setData('brand_name', ''); // Reset brand_name in data
      setData('model_name', ''); // Reset model_name in data
    };
  
    const handleChevronDown = () => {
      // setIsDropdownOpen(true);
      // setSelectedModel(null); // Reset model when user opens dropdown again
      setIsDropdownOpen((prev) => !prev);
    };
  
    const handleAllModelsClick = () => {
      if (selectedBrand) {
        setData('brand_name', selectedBrand.name); // Set brand value
        setData('model_name', ''); // Reset model if user chooses "All Models"
        setSearchTerm(selectedBrand.name); // Show brand name
        setIsDropdownOpen(false); // Close dropdown
      }
    };
  
    // Handle when the user types in the search bar after selecting a brand
    const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
      if (selectedBrand || selectedModel) {
        // If a brand or model is selected, reset them when search is updated
        setSelectedBrand(null);
        setSelectedModel(null);
        setData('brand_name', '');
        setData('model_name', '');
        setModels([]); // Clear models when searching
      }
    };
  
    return (
      <div className="relative w-full" ref={dropdownRef}>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange} // Handle search changes
            onFocus={() => setIsDropdownOpen(true)}
            className="w-full pl-4 pr-10 py-2 border rounded-l-none focus:outline-none focus:ring-0 focus:border-inherit text-gray-600"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={handleChevronDown} // Open dropdown when Chevron is clicked
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
                      <LazyLoadImage
                        src={selectedBrand.image}
                        alt={selectedBrand.name}
                        width={30}
                        height={20}
                        className="object-contain"
                        effect="blur" // Optional effect for lazy loading
                      />
                    </div>
                    <span className="font-medium">{selectedBrand.name} Models</span>
                  </div>
                </div>
  
                {/* "All Models" Header */}
                <div
                  className="p-3 font-bold flex justify-between items-center hover:bg-gray-100 border-b cursor-pointer"
                  onClick={handleAllModelsClick} // Set brand and reset model
                >
                  <span className="cursor-pointer">All Models</span>
                  <span className="text-sm text-gray-600">{models.length}</span>
                </div>
  
                {/* Individual Models List */}
                {loading ? (
                  <div className="p-3 text-gray-500 text-center">Loading models...</div>
                ) : models.length > 0 ? (
                  models.map((model, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                      onClick={() => handleModelSelect(model)}
                    >
                      <span>{model.model}</span>
                      <span className="text-sm text-gray-500">{model.count}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-gray-500 text-center">No models available</div>
                )}
              </div>
            ) : (
              filteredBrands.map((brand) => (
                <div key={brand.id}>
                  <div
                    className="p-3 hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={() => handleBrandSelect(brand)}
                  >
                    <div className="w-8 h-8 mr-3 relative">
                      <LazyLoadImage
                        src={brand.image}
                        alt={brand.name}
                        width={30}
                        height={20}
                        className="object-contain"
                        effect="blur"
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
  
  
  
  
  

export default SearchFilterBar
