import Header from '../components/Layout/Header';

const ZIndexTest = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header userRole="admin" />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Z-Index Test Page
        </h1>
        
        <div className="space-y-8">
          {/* High z-index content that should NOT cover the notification dropdown */}
          <div 
            className="bg-red-500 text-white p-8 rounded-lg shadow-lg"
            style={{ 
              position: 'relative',
              zIndex: 999999,
            }}
          >
            <h2 className="text-2xl font-bold mb-4">High Z-Index Content (z-index: 999999)</h2>
            <p>This content has a very high z-index value. The notification dropdown should still appear above this.</p>
            <p className="mt-2 text-yellow-200">
              🔔 Click the bell icon in the header to test the notification dropdown visibility.
            </p>
          </div>
          
          <div 
            className="bg-blue-500 text-white p-8 rounded-lg shadow-lg"
            style={{ 
              position: 'relative',
              zIndex: 1000000,
            }}
          >
            <h2 className="text-2xl font-bold mb-4">Even Higher Z-Index Content (z-index: 1000000)</h2>
            <p>This content has an even higher z-index. The notification dropdown should still appear above this.</p>
          </div>
          
          <div 
            className="bg-purple-500 text-white p-8 rounded-lg shadow-lg"
            style={{ 
              position: 'fixed',
              top: '200px',
              right: '20px',
              width: '300px',
              zIndex: 2000000,
            }}
          >
            <h2 className="text-xl font-bold mb-4">Fixed Position High Z-Index (z-index: 2000000)</h2>
            <p>This is a fixed position element with extremely high z-index. The notification dropdown should still appear above this.</p>
          </div>
          
          <div 
            className="bg-green-500 text-white p-8 rounded-lg shadow-lg"
            style={{ 
              position: 'sticky',
              top: '100px',
              zIndex: 1500000,
            }}
          >
            <h2 className="text-2xl font-bold mb-4">Sticky Position High Z-Index (z-index: 1500000)</h2>
            <p>This is a sticky positioned element with high z-index. The notification dropdown should still appear above this.</p>
          </div>
          
          <div className="bg-gray-200 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Regular Content</h2>
            <p className="text-gray-600">This is regular content with default z-index. The notification dropdown should definitely appear above this.</p>
          </div>
          
          {/* More content to make the page scrollable */}
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Content Block {index + 1}</h3>
              <p className="text-gray-600">
                This is additional content to make the page scrollable. The notification dropdown should work correctly even when scrolling.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ZIndexTest;
