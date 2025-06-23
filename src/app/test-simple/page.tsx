export default function TestSimple() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-green-100 py-12">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          🎨 Luna Dragon Test Page
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Testing if basic page loads correctly
        </p>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
          <div className="text-6xl mb-4">🐉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Luna the Dragon</h2>
          <p className="text-gray-600 mb-6">
            If you can see this, the page is loading correctly!
          </p>
          
          <button 
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg"
            onClick={() => alert('Basic button works!')}
          >
            🎨 Test Button
          </button>
        </div>
      </div>
    </div>
  )
}
