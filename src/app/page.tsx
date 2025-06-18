'use client'

import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-purple-100 to-pink-200 relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl animate-float">🎈</div>
        <div className="absolute top-32 right-20 text-4xl animate-bounce-slow">⭐</div>
        <div className="absolute top-40 left-1/4 text-5xl animate-float-delayed">🌈</div>
        <div className="absolute top-60 right-1/3 text-3xl animate-bounce-slow">🦋</div>
        <div className="absolute bottom-40 left-16 text-4xl animate-float">🎪</div>
        <div className="absolute bottom-32 right-24 text-5xl animate-bounce-slow">🎨</div>
      </div>

      <Header />

      {/* Hero Section with Playful Kids */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 relative">
        <div className="text-center relative">
          {/* Colorful background shapes */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-300 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute top-40 right-32 w-24 h-24 bg-pink-400 rounded-full opacity-40 animate-pulse-delayed"></div>
            <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-blue-300 rounded-full opacity-25 animate-pulse"></div>
          </div>

          <h2 className="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-6 animate-text-glow">
            🌟 Magical Story Adventures 🌟
          </h2>
          
          {/* Enhanced Cartoon Kids Illustration */}
          <div className="relative mb-8 py-8">
            <div className="flex justify-center items-end space-x-6 mb-6">
              
              {/* Enhanced Child 1 - Girl with book (Cartoon Style) */}
              <div className="relative animate-bounce-gentle group">
                <div className="w-24 h-32 relative">
                  {/* Head */}
                  <div className="absolute top-0 left-4 w-16 h-16 character-head rounded-full relative">
                    {/* Hair */}
                    <div className="absolute -top-2 -left-2 w-20 h-14 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full hair-texture"></div>
                    <div className="absolute -top-1 left-1 w-6 h-8 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full transform -rotate-12"></div>
                    <div className="absolute -top-1 right-1 w-6 h-8 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full transform rotate-12"></div>
                    
                    {/* Face */}
                    <div className="absolute top-4 left-3 w-2 h-2 bg-gray-800 rounded-full"></div> {/* Left eye */}
                    <div className="absolute top-4 right-3 w-2 h-2 bg-gray-800 rounded-full"></div> {/* Right eye */}
                    <div className="absolute top-6 left-5 w-6 h-1 bg-pink-400 rounded-full"></div> {/* Smile */}
                    <div className="absolute top-7 left-6 w-4 h-1 bg-pink-300 rounded-full"></div> {/* Mouth */}
                    
                    {/* Blush */}
                    <div className="absolute top-5 left-1 w-3 h-2 bg-pink-300 rounded-full opacity-60"></div>
                    <div className="absolute top-5 right-1 w-3 h-2 bg-pink-300 rounded-full opacity-60"></div>
                  </div>
                  
                  {/* Body - Pink dress */}
                  <div className="absolute top-14 left-2 w-20 h-16 bg-gradient-to-b from-pink-400 to-pink-500 rounded-t-lg relative character-body">
                    {/* Dress details */}
                    <div className="absolute top-2 left-2 w-16 h-1 bg-pink-300 rounded"></div>
                    <div className="absolute top-4 left-4 w-12 h-1 bg-pink-300 rounded"></div>
                    
                    {/* Arms */}
                    <div className="absolute -left-2 top-2 w-6 h-8 character-limb rounded-full"></div>
                    <div className="absolute -right-2 top-2 w-6 h-8 character-limb rounded-full"></div>
                    
                    {/* Book in hands */}
                    <div className="absolute -right-1 top-4 w-8 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded border-2 border-purple-400 shadow-sm cartoon-shadow">
                      <div className="absolute top-1 left-1 w-6 h-1 bg-purple-300 rounded"></div>
                      <div className="absolute top-2 left-1 w-4 h-1 bg-purple-300 rounded"></div>
                      <div className="absolute top-3 left-1 w-5 h-1 bg-purple-300 rounded"></div>
                    </div>
                  </div>
                  
                  {/* Legs */}
                  <div className="absolute bottom-2 left-4 w-4 h-8 character-limb rounded-full"></div>
                  <div className="absolute bottom-2 right-4 w-4 h-8 character-limb rounded-full"></div>
                  
                  {/* Shoes */}
                  <div className="absolute bottom-0 left-3 w-6 h-3 bg-red-500 rounded-full cartoon-shadow"></div>
                  <div className="absolute bottom-0 right-3 w-6 h-3 bg-red-500 rounded-full cartoon-shadow"></div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-4 -right-2 text-lg animate-float opacity-80">✨</div>
                <div className="absolute -top-2 -left-3 text-sm animate-bounce-slow opacity-60">📚</div>
              </div>

              {/* Enhanced Child 2 - Boy with art supplies (Cartoon Style) */}
              <div className="relative animate-bounce-gentle animation-delay-200 group">
                <div className="w-24 h-32 relative">
                  {/* Head */}
                  <div className="absolute top-0 left-4 w-16 h-16 character-head rounded-full relative">
                    {/* Hair - messy brown */}
                    <div className="absolute -top-3 -left-1 w-18 h-12 bg-gradient-to-b from-amber-700 to-amber-800 rounded-full hair-texture"></div>
                    <div className="absolute -top-2 left-2 w-4 h-6 bg-gradient-to-b from-amber-700 to-amber-800 rounded-full transform -rotate-20"></div>
                    <div className="absolute -top-1 right-0 w-5 h-7 bg-gradient-to-b from-amber-700 to-amber-800 rounded-full transform rotate-15"></div>
                    
                    {/* Face */}
                    <div className="absolute top-4 left-3 w-2 h-2 bg-gray-800 rounded-full"></div>
                    <div className="absolute top-4 right-3 w-2 h-2 bg-gray-800 rounded-full"></div>
                    <div className="absolute top-6 left-4 w-8 h-2 bg-yellow-400 rounded-full"></div> {/* Big smile */}
                    <div className="absolute top-7 left-6 w-4 h-1 bg-red-400 rounded-full"></div>
                    
                    {/* Freckles */}
                    <div className="absolute top-5 left-2 w-1 h-1 bg-orange-400 rounded-full"></div>
                    <div className="absolute top-6 right-2 w-1 h-1 bg-orange-400 rounded-full"></div>
                  </div>
                  
                  {/* Body - Blue shirt */}
                  <div className="absolute top-14 left-2 w-20 h-16 bg-gradient-to-b from-blue-400 to-blue-500 rounded-t-lg relative character-body">
                    {/* Shirt details */}
                    <div className="absolute top-1 left-8 w-4 h-8 bg-blue-300 rounded"></div> {/* Collar */}
                    
                    {/* Arms */}
                    <div className="absolute -left-2 top-2 w-6 h-8 character-limb rounded-full"></div>
                    <div className="absolute -right-2 top-2 w-6 h-8 character-limb rounded-full"></div>
                    
                    {/* Art palette in hands */}
                    <div className="absolute -right-1 top-4 w-10 h-6 bg-gradient-to-b from-gray-100 to-gray-200 rounded-full border-2 border-gray-300 shadow-sm cartoon-shadow">
                      <div className="absolute top-1 left-1 w-2 h-2 bg-red-400 rounded-full"></div>
                      <div className="absolute top-1 left-4 w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <div className="absolute bottom-1 left-2 w-2 h-2 bg-green-400 rounded-full"></div>
                      <div className="absolute bottom-1 right-2 w-2 h-2 bg-purple-400 rounded-full"></div>
                    </div>
                    
                    {/* Paint brush */}
                    <div className="absolute -left-1 top-4 w-1 h-8 bg-amber-600 rounded-full"></div>
                    <div className="absolute -left-1 top-3 w-2 h-2 bg-pink-500 rounded-full"></div>
                  </div>
                  
                  {/* Legs - shorts */}
                  <div className="absolute bottom-6 left-3 w-18 h-6 bg-gradient-to-b from-green-400 to-green-500 rounded"></div>
                  <div className="absolute bottom-2 left-4 w-4 h-6 character-limb rounded-full"></div>
                  <div className="absolute bottom-2 right-4 w-4 h-6 character-limb rounded-full"></div>
                  
                  {/* Shoes */}
                  <div className="absolute bottom-0 left-3 w-6 h-3 bg-blue-600 rounded-full cartoon-shadow"></div>
                  <div className="absolute bottom-0 right-3 w-6 h-3 bg-blue-600 rounded-full cartoon-shadow"></div>
                </div>
                
                {/* Floating paint drops */}
                <div className="absolute -top-3 -right-1 text-sm animate-float opacity-80">🎨</div>
                <div className="absolute -top-5 left-0 w-2 h-2 bg-red-400 rounded-full animate-bounce-slow"></div>
                <div className="absolute -top-4 right-2 w-2 h-2 bg-blue-400 rounded-full animate-float"></div>
              </div>

              {/* Enhanced Child 3 - Girl dancing (Cartoon Style) */}
              <div className="relative animate-bounce-gentle animation-delay-400 group">
                <div className="w-24 h-32 relative">
                  {/* Head */}
                  <div className="absolute top-0 left-4 w-16 h-16 character-head rounded-full relative">
                    {/* Hair - curly with ribbons */}
                    <div className="absolute -top-3 -left-2 w-20 h-14 bg-gradient-to-b from-red-600 to-red-700 rounded-full hair-texture"></div>
                    <div className="absolute -top-2 left-0 w-6 h-8 bg-gradient-to-b from-red-600 to-red-700 rounded-full transform -rotate-30"></div>
                    <div className="absolute -top-2 right-0 w-6 h-8 bg-gradient-to-b from-red-600 to-red-700 rounded-full transform rotate-30"></div>
                    
                    {/* Hair ribbons */}
                    <div className="absolute -top-1 left-1 w-4 h-2 bg-pink-400 rounded transform -rotate-20"></div>
                    <div className="absolute -top-1 right-1 w-4 h-2 bg-pink-400 rounded transform rotate-20"></div>
                    
                    {/* Face */}
                    <div className="absolute top-4 left-3 w-2 h-2 bg-gray-800 rounded-full"></div>
                    <div className="absolute top-4 right-3 w-2 h-2 bg-gray-800 rounded-full"></div>
                    <div className="absolute top-6 left-4 w-8 h-2 bg-pink-400 rounded-full"></div>
                    <div className="absolute top-7 left-6 w-4 h-1 bg-red-400 rounded-full"></div>
                    
                    {/* Sparkles in eyes */}
                    <div className="absolute top-4 left-3 w-1 h-1 bg-white rounded-full"></div>
                    <div className="absolute top-4 right-3 w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  
                  {/* Body - Green dance dress */}
                  <div className="absolute top-14 left-1 w-22 h-16 bg-gradient-to-b from-green-400 to-green-500 rounded-t-lg relative character-body transform rotate-3">
                    {/* Dress flowing effect */}
                    <div className="absolute bottom-0 -left-2 w-6 h-4 bg-green-400 rounded-full transform -rotate-12"></div>
                    <div className="absolute bottom-0 -right-2 w-6 h-4 bg-green-400 rounded-full transform rotate-12"></div>
                    
                    {/* Arms in dance pose */}
                    <div className="absolute -left-3 top-1 w-6 h-8 character-limb rounded-full transform -rotate-45"></div>
                    <div className="absolute -right-3 top-0 w-6 h-8 character-limb rounded-full transform rotate-45"></div>
                    
                    {/* Dress decorations */}
                    <div className="absolute top-3 left-3 w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <div className="absolute top-5 left-6 w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <div className="absolute top-4 right-3 w-2 h-2 bg-yellow-400 rounded-full"></div>
                  </div>
                  
                  {/* Legs in dance position */}
                  <div className="absolute bottom-2 left-3 w-4 h-8 character-limb rounded-full transform rotate-12"></div>
                  <div className="absolute bottom-2 right-5 w-4 h-8 character-limb rounded-full transform -rotate-12"></div>
                  
                  {/* Dancing shoes */}
                  <div className="absolute bottom-0 left-2 w-6 h-3 bg-pink-500 rounded-full transform rotate-12 cartoon-shadow"></div>
                  <div className="absolute bottom-0 right-4 w-6 h-3 bg-pink-500 rounded-full transform -rotate-12 cartoon-shadow"></div>
                </div>
                
                {/* Musical notes */}
                <div className="absolute -top-4 -left-2 text-lg animate-float opacity-80">🎵</div>
                <div className="absolute -top-6 right-0 text-sm animate-bounce-slow opacity-60">🎶</div>
                <div className="absolute -top-3 right-3 text-xs animate-float opacity-70">✨</div>
              </div>

              {/* Enhanced Child 4 - Boy with imagination (Cartoon Style) */}
              <div className="relative animate-bounce-gentle animation-delay-600 group">
                <div className="w-24 h-32 relative">
                  {/* Head */}
                  <div className="absolute top-0 left-4 w-16 h-16 character-head rounded-full relative">
                    {/* Hair - spiky */}
                    <div className="absolute -top-4 left-2 w-12 h-10 bg-gradient-to-b from-purple-700 to-purple-800 rounded-full hair-texture"></div>
                    <div className="absolute -top-3 left-1 w-3 h-6 bg-gradient-to-b from-purple-700 to-purple-800 rounded transform -rotate-30"></div>
                    <div className="absolute -top-3 left-5 w-3 h-6 bg-gradient-to-b from-purple-700 to-purple-800 rounded"></div>
                    <div className="absolute -top-3 right-1 w-3 h-6 bg-gradient-to-b from-purple-700 to-purple-800 rounded transform rotate-30"></div>
                    
                    {/* Face - thoughtful expression */}
                    <div className="absolute top-4 left-3 w-2 h-2 bg-gray-800 rounded-full"></div>
                    <div className="absolute top-4 right-3 w-2 h-2 bg-gray-800 rounded-full"></div>
                    <div className="absolute top-6 left-6 w-4 h-1 bg-gray-600 rounded-full"></div> {/* Thoughtful mouth */}
                    
                    {/* Thinking expression */}
                    <div className="absolute top-3 left-2 w-3 h-1 bg-gray-600 rounded transform rotate-12"></div> {/* Eyebrow */}
                    <div className="absolute top-3 right-2 w-3 h-1 bg-gray-600 rounded transform -rotate-12"></div>
                  </div>
                  
                  {/* Body - Purple sweater */}
                  <div className="absolute top-14 left-2 w-20 h-16 bg-gradient-to-b from-purple-400 to-purple-500 rounded-t-lg relative character-body">
                    {/* Sweater texture */}
                    <div className="absolute top-2 left-1 w-18 h-1 bg-purple-300 rounded"></div>
                    <div className="absolute top-4 left-1 w-18 h-1 bg-purple-300 rounded"></div>
                    <div className="absolute top-6 left-1 w-18 h-1 bg-purple-300 rounded"></div>
                    
                    {/* Arms */}
                    <div className="absolute -left-2 top-2 w-6 h-8 character-limb rounded-full"></div>
                    <div className="absolute -right-2 top-2 w-6 h-8 character-limb rounded-full"></div>
                    
                    {/* Book in hands */}
                    <div className="absolute right-0 top-6 w-8 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded border-2 border-blue-400 cartoon-shadow">
                      <div className="absolute top-1 left-1 w-6 h-1 bg-blue-300 rounded"></div>
                      <div className="absolute top-2 left-1 w-4 h-1 bg-blue-300 rounded"></div>
                    </div>
                  </div>
                  
                  {/* Legs */}
                  <div className="absolute bottom-2 left-4 w-4 h-8 character-limb rounded-full"></div>
                  <div className="absolute bottom-2 right-4 w-4 h-8 character-limb rounded-full"></div>
                  
                  {/* Shoes */}
                  <div className="absolute bottom-0 left-3 w-6 h-3 bg-gray-700 rounded-full cartoon-shadow"></div>
                  <div className="absolute bottom-0 right-3 w-6 h-3 bg-gray-700 rounded-full cartoon-shadow"></div>
                </div>
                
                {/* Thought bubble with imagination */}
                <div className="absolute -top-8 -right-4 w-16 h-12 bg-white rounded-3xl border-2 border-gray-200 shadow-lg relative cartoon-shadow">
                  <div className="absolute bottom-0 left-4 w-3 h-3 bg-white border-l-2 border-b-2 border-gray-200 transform rotate-45"></div>
                  <div className="absolute top-2 left-2 text-xs">🚀</div>
                  <div className="absolute top-1 right-2 text-xs">⭐</div>
                  <div className="absolute bottom-1 left-3 text-xs">🌙</div>
                  <div className="absolute bottom-2 right-1 text-xs">🪐</div>
                </div>
                
                {/* Small thought bubbles */}
                <div className="absolute -top-4 -right-1 w-3 h-3 bg-white rounded-full border border-gray-200 cartoon-shadow"></div>
                <div className="absolute -top-2 right-1 w-2 h-2 bg-white rounded-full border border-gray-200 cartoon-shadow"></div>
              </div>
            </div>

            {/* Enhanced Magical Playground Scene */}
            <div className="h-6 bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-full mx-auto w-96 relative cartoon-shadow">
              <div className="absolute inset-0 bg-gradient-to-t from-green-700/40 to-transparent rounded-full"></div>
              
              {/* Playground elements */}
              <div className="absolute -top-3 left-8 w-6 h-6 bg-yellow-400 rounded-full border-2 border-yellow-500"></div> {/* Sun */}
              <div className="absolute -top-2 left-20 text-sm animate-bounce-slow">🌸</div>
              <div className="absolute -top-2 right-20 text-sm animate-float">🌺</div>
              <div className="absolute -top-2 left-32 text-sm animate-bounce-gentle">🌼</div>
              <div className="absolute -top-2 right-32 text-sm animate-float">🌻</div>
              
              {/* Playground equipment */}
              <div className="absolute -top-6 left-16 w-8 h-6 bg-red-400 rounded-t-full"></div> {/* Slide */}
              <div className="absolute -top-4 left-16 w-1 h-4 bg-gray-600"></div>
              <div className="absolute -top-8 right-16 w-2 h-8 bg-brown-600 rounded"></div> {/* Tree */}
              <div className="absolute -top-6 right-15 w-6 h-4 bg-green-500 rounded-full"></div> {/* Tree top */}
              
              {/* Story elements floating around */}
              <div className="absolute -top-10 left-1/4 text-xs animate-float opacity-70">📖</div>
              <div className="absolute -top-8 right-1/4 text-xs animate-bounce-slow opacity-60">✨</div>
              <div className="absolute -top-12 left-1/2 text-lg animate-float opacity-80">🏰</div>
            </div>
            
            {/* Story Magic Visualization */}
            <div className="mt-8 relative">
              <div className="text-center">
                <div className="inline-block relative">
                  <div className="text-6xl animate-text-glow">📚</div>
                  <div className="absolute -top-2 -right-2 text-sm animate-float">✨</div>
                  <div className="absolute -bottom-1 -left-2 text-xs animate-bounce-slow">🌟</div>
                </div>
                <div className="mt-2 text-sm text-purple-600 font-medium">Stories Come to Life!</div>
              </div>
              
              {/* Flowing story elements */}
              <div className="absolute top-8 left-1/4 flex space-x-2 animate-float">
                <div className="w-4 h-4 bg-pink-400 rounded-full"></div>
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              </div>
              <div className="absolute top-6 right-1/4 flex space-x-2 animate-bounce-gentle">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <div className="w-4 h-4 bg-orange-400 rounded-full"></div>
              </div>
            </div>
          </div>

          <p className="text-xl text-gray-800 mb-8 max-w-3xl mx-auto leading-relaxed font-medium">
            🎨 Create personalized adventures with colorful characters that grow with your child! 
            ✨ AI-powered stories with beautiful illustrations in a vibrant, magical world where imagination comes alive! 🌈
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              variant="primary" 
              size="lg" 
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
              onClick={() => router.push('/auth/signin')}
            >
              🚀 Start Creating Magic
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-purple-500 text-purple-700 hover:bg-purple-50 shadow-lg transform hover:scale-105 transition-all duration-200"
              onClick={() => router.push('/stories')}
            >
              👀 View Sample Stories
            </Button>
          </div>

          {/* Colorful Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <Card hover className="p-8 bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-300 shadow-xl transform hover:scale-105 transition-all duration-300">
              <CardContent className="text-center p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg animate-bounce-gentle">
                  <span className="text-white text-3xl">🎭</span>
                </div>
                <h3 className="text-xl font-semibold text-blue-800 mb-3">Character Consistency</h3>
                <p className="text-blue-700">Your child&apos;s favorite characters remember their adventures and grow with each magical story! 🌟</p>
              </CardContent>
            </Card>
            
            <Card hover className="p-8 bg-gradient-to-br from-pink-100 to-rose-100 border-2 border-pink-300 shadow-xl transform hover:scale-105 transition-all duration-300">
              <CardContent className="text-center p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-red-500 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg animate-bounce-gentle animation-delay-200">
                  <span className="text-white text-3xl">🎨</span>
                </div>
                <h3 className="text-xl font-semibold text-pink-800 mb-3">Beautiful Illustrations</h3>
                <p className="text-pink-700">Pixar-style artwork brings every story to life with warm, vibrant colors that sparkle! ✨</p>
              </CardContent>
            </Card>
            
            <Card hover className="p-8 bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 shadow-xl transform hover:scale-105 transition-all duration-300">
              <CardContent className="text-center p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg animate-bounce-gentle animation-delay-400">
                  <span className="text-white text-3xl">📚</span>
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-3">Reading Progress</h3>
                <p className="text-green-700">Seamlessly sync progress across devices and never lose your place in the adventure! 🚀</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Storybook Showcase Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 relative overflow-hidden">
        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-20 text-4xl animate-float opacity-20">📚</div>
          <div className="absolute top-32 right-32 text-3xl animate-bounce-slow opacity-30">✨</div>
          <div className="absolute bottom-20 left-1/4 text-5xl animate-float-delayed opacity-25">🎨</div>
          <div className="absolute bottom-40 right-20 text-3xl animate-bounce-gentle opacity-20">🌟</div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 animate-text-glow">
              📚 Your Stories, Beautifully Printed ✨
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              🎨 Transform your digital adventures into gorgeous hardcover keepsakes that sparkle with color and will be treasured forever! 🌈
            </p>
          </div>
          
          <div className="relative mb-16">
            {/* Magical Tabletop Scene */}
            <div className="relative bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 rounded-3xl p-8 shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300">
              {/* Magical sparkles */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-4 left-12 text-yellow-300 text-sm animate-bounce-slow">✨</div>
                <div className="absolute top-16 right-16 text-yellow-200 text-xs animate-float">⭐</div>
                <div className="absolute bottom-6 left-8 text-yellow-400 text-sm animate-bounce-gentle">💫</div>
              </div>
              
              {/* Wood grain effect with rainbow shimmer */}
              <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-amber-700 via-purple-700/20 to-pink-700/20 animate-pulse-delayed"></div>
              
              <div className="relative flex flex-wrap justify-center gap-6 items-end">
                {/* Book 1 - Enhanced with glow */}
                <div className="relative transform rotate-2 hover:rotate-0 hover:scale-110 transition-all duration-300">
                  <div className="w-32 h-40 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-lg shadow-xl relative overflow-hidden border-2 border-blue-300/50">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-700/30"></div>
                    <div className="p-4 text-white text-center relative z-10">
                      <div className="text-xs font-bold mb-2 text-blue-100">Luna&apos;s Moonlight Adventure</div>
                      <div className="text-3xl animate-bounce-gentle">🦊</div>
                      <div className="text-xs text-blue-200 mt-1">✨ Magical ✨</div>
                    </div>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg blur opacity-30 -z-10"></div>
                </div>
                
                {/* Book 2 - Enhanced with glow */}
                <div className="relative transform -rotate-1 hover:rotate-0 hover:scale-110 transition-all duration-300">
                  <div className="w-32 h-40 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-lg shadow-xl relative overflow-hidden border-2 border-green-300/50">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-green-700/30"></div>
                    <div className="p-4 text-white text-center relative z-10">
                      <div className="text-xs font-bold mb-2 text-green-100">The Magic Garden</div>
                      <div className="text-3xl animate-bounce-gentle animation-delay-200">🐰</div>
                      <div className="text-xs text-green-200 mt-1">🌸 Blooming 🌸</div>
                    </div>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg blur opacity-30 -z-10"></div>
                </div>
                
                {/* Book 3 - Enhanced with glow */}
                <div className="relative transform rotate-1 hover:rotate-0 hover:scale-110 transition-all duration-300">
                  <div className="w-32 h-40 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 rounded-lg shadow-xl relative overflow-hidden border-2 border-purple-300/50">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-purple-700/30"></div>
                    <div className="p-4 text-white text-center relative z-10">
                      <div className="text-xs font-bold mb-2 text-purple-100">Wizard&apos;s First Spell</div>
                      <div className="text-3xl animate-bounce-gentle animation-delay-400">🧙‍♂️</div>
                      <div className="text-xs text-purple-200 mt-1">🔮 Mystical 🔮</div>
                    </div>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg blur opacity-30 -z-10"></div>
                </div>
                
                {/* Book 4 - Enhanced with glow */}
                <div className="relative transform -rotate-2 hover:rotate-0 hover:scale-110 transition-all duration-300">
                  <div className="w-32 h-40 bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600 rounded-lg shadow-xl relative overflow-hidden border-2 border-pink-300/50">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-pink-700/30"></div>
                    <div className="p-4 text-white text-center relative z-10">
                      <div className="text-xs font-bold mb-2 text-pink-100">Ocean Explorer</div>
                      <div className="text-3xl animate-bounce-gentle animation-delay-600">👧</div>
                      <div className="text-xs text-pink-200 mt-1">🌊 Adventurous 🌊</div>
                    </div>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-rose-500 rounded-lg blur opacity-30 -z-10"></div>
                </div>
              </div>
              
              {/* Enhanced decorative items */}
              <div className="absolute top-4 left-4 text-3xl opacity-70 animate-float">✏️</div>
              <div className="absolute top-6 right-8 text-2xl opacity-60 animate-bounce-slow text-yellow-300">⭐</div>
              <div className="absolute bottom-4 right-4 text-2xl opacity-50 animate-bounce-gentle">🔖</div>
              <div className="absolute bottom-6 left-6 text-xl opacity-40 animate-float text-rainbow">🌈</div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card hover className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 shadow-xl transform hover:scale-105 transition-all duration-300">
              <CardContent className="text-center p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg animate-bounce-gentle">
                  <span className="text-white text-3xl">📖</span>
                </div>
                <h3 className="text-xl font-semibold text-blue-800 mb-3">✨ Premium Quality ✨</h3>
                <p className="text-blue-700">Thick, glossy pages with vibrant rainbow colors that make every illustration sparkle and pop off the page! 🌈</p>
              </CardContent>
            </Card>
            
            <Card hover className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 shadow-xl transform hover:scale-105 transition-all duration-300">
              <CardContent className="text-center p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg animate-bounce-gentle animation-delay-200">
                  <span className="text-white text-3xl">💎</span>
                </div>
                <h3 className="text-xl font-semibold text-purple-800 mb-3">🏰 Hardcover Binding 🏰</h3>
                <p className="text-purple-700">Durable magical hardcover books that can withstand countless bedtime readings and epic adventures! ✨</p>
              </CardContent>
            </Card>
            
            <Card hover className="p-8 bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-300 shadow-xl transform hover:scale-105 transition-all duration-300">
              <CardContent className="text-center p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg animate-bounce-gentle animation-delay-400">
                  <span className="text-white text-3xl">🎁</span>
                </div>
                <h3 className="text-xl font-semibold text-pink-800 mb-3">🎉 Perfect Gifts 🎉</h3>
                <p className="text-pink-700">Create personalized magical books for birthdays, holidays, or any special occasion that celebrates your wonderful child! 🎈</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 relative overflow-hidden" id="pricing">
        {/* Floating pricing decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 left-16 text-4xl animate-bounce-slow opacity-20">💰</div>
          <div className="absolute top-40 right-24 text-3xl animate-float opacity-25">🎯</div>
          <div className="absolute bottom-32 left-1/3 text-5xl animate-bounce-gentle opacity-15">🚀</div>
          <div className="absolute bottom-16 right-16 text-3xl animate-float-delayed opacity-20">⭐</div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent mb-4 animate-text-glow">
              🚀 Choose Your Adventure Plan ✨
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              🌟 Start creating magical stories for free, or unlock unlimited rainbow adventures with our premium plans! 🌈
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <Card className="relative p-8 border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-blue-50 transform hover:scale-105 transition-all duration-300">
              <CardContent className="text-center p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-blue-500 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-bounce-gentle">
                  <span className="text-white text-3xl">🌱</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">🌟 Starter</h3>
                <div className="text-4xl font-bold text-gray-900 mb-1">Free</div>
                <div className="text-gray-600 mb-6">Perfect for trying out StoryNest! ✨</div>
                
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    3 stories per month 📚
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    1 child profile 👶
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    3 custom characters 🎭
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Digital stories only 📱
                  </li>
                </ul>
                
                <Button variant="outline" className="w-full border-2 border-blue-500 text-blue-700 hover:bg-blue-50">
                  🚀 Get Started Free
                </Button>
              </CardContent>
            </Card>
            
            {/* Premium Plan */}
            <Card className="relative p-8 border-2 border-orange-500 bg-gradient-to-br from-orange-50 to-rose-50 transform hover:scale-105 transition-all duration-300 shadow-xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold animate-bounce-gentle">
                ⭐ Most Popular ⭐
              </div>
              <CardContent className="text-center p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-bounce-gentle animation-delay-200">
                  <span className="text-white text-3xl">👨‍👩‍👧‍👦</span>
                </div>
                <h3 className="text-2xl font-bold text-orange-800 mb-2">🏠 Family</h3>
                <div className="text-4xl font-bold text-gray-900 mb-1">$9.99</div>
                <div className="text-orange-600 mb-6">per month 🌈</div>
                
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Unlimited stories ∞✨
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Up to 4 child profiles 👨‍👩‍👧‍👦
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Unlimited characters 🎭🌈
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Premium illustrations 🎨✨
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Priority support ⚡
                  </li>
                </ul>
                
                <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                  🌟 Start Free Trial
                </Button>
              </CardContent>
            </Card>
            
            {/* Print Plan */}
            <Card className="relative p-8 border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 transform hover:scale-105 transition-all duration-300">
              <CardContent className="text-center p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-bounce-gentle animation-delay-400">
                  <span className="text-white text-3xl">📚</span>
                </div>
                <h3 className="text-2xl font-bold text-purple-800 mb-2">👑 Premium Print</h3>
                <div className="text-4xl font-bold text-gray-900 mb-1">$19.99</div>
                <div className="text-purple-600 mb-6">per month 🎁</div>
                
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Everything in Family ⭐
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    2 printed books/month 📖📚
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Hardcover binding 💎
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Premium rainbow paper 🌈
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Free magical shipping ✈️✨
                  </li>
                </ul>
                
                <Button variant="secondary" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600">
                  🎨 Start Creating
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Story Creation Process Visualization */}
      <div className="mt-16 relative">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            ✨ Watch Stories Come to Life ✨
          </h3>
          <p className="text-gray-700">From your imagination to magical adventures in just three steps!</p>
        </div>
        
        <div className="flex justify-center items-center space-x-8 mb-8">
          {/* Step 1: Input */}
          <div className="relative group">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center character-body transform hover:scale-110 transition-all duration-300">
              <div className="text-white text-3xl">💭</div>
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
              <div className="text-sm font-semibold text-blue-600">Think</div>
              <div className="text-xs text-gray-500">Your idea</div>
            </div>
            {/* Floating thought elements */}
            <div className="absolute -top-2 -right-1 text-sm animate-float opacity-70">💡</div>
            <div className="absolute -top-4 left-2 text-xs animate-bounce-slow opacity-60">✨</div>
          </div>
          
          {/* Arrow */}
          <div className="text-3xl text-purple-400 animate-bounce-gentle">→</div>
          
          {/* Step 2: AI Magic */}
          <div className="relative group">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center character-body transform hover:scale-110 transition-all duration-300">
              <div className="text-white text-3xl">🪄</div>
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
              <div className="text-sm font-semibold text-purple-600">Create</div>
              <div className="text-xs text-gray-500">AI magic</div>
            </div>
            {/* Magic sparkles */}
            <div className="absolute -top-3 -left-2 text-sm animate-float opacity-80">✨</div>
            <div className="absolute -top-1 -right-3 text-xs animate-bounce-slow opacity-70">⭐</div>
            <div className="absolute -bottom-2 -left-1 text-xs animate-float opacity-60">🌟</div>
          </div>
          
          {/* Arrow */}
          <div className="text-3xl text-purple-400 animate-bounce-gentle animation-delay-200">→</div>
          
          {/* Step 3: Beautiful Story */}
          <div className="relative group">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-pink-500 rounded-2xl flex items-center justify-center character-body transform hover:scale-110 transition-all duration-300">
              <div className="text-white text-3xl">📖</div>
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
              <div className="text-sm font-semibold text-pink-600">Enjoy</div>
              <div className="text-xs text-gray-500">Your story</div>
            </div>
            {/* Story elements */}
            <div className="absolute -top-2 -right-2 text-sm animate-float opacity-80">🎨</div>
            <div className="absolute -top-4 left-1 text-xs animate-bounce-slow opacity-60">📚</div>
            <div className="absolute -bottom-1 -right-1 text-xs animate-float opacity-70">💖</div>
          </div>
        </div>
        
        {/* Sample story preview */}
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-200 cartoon-shadow">
          <div className="text-center mb-4">
            <div className="text-lg font-bold text-purple-800">🦊 Luna&apos;s Magical Day</div>
            <div className="text-sm text-gray-600">A personalized adventure</div>
          </div>
          
          {/* Mini story illustration */}
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-4 mb-4 relative overflow-hidden">
            {/* Simple cartoon scene */}
            <div className="relative h-20">
              {/* Background elements */}
              <div className="absolute top-2 right-4 w-8 h-8 bg-yellow-300 rounded-full"></div> {/* Sun */}
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-green-400 rounded"></div> {/* Ground */}
              
              {/* Fox character */}
              <div className="absolute bottom-3 left-6 w-8 h-8 bg-orange-400 rounded-full relative">
                <div className="absolute -top-1 left-1 w-3 h-3 bg-orange-500 rounded-full"></div> {/* Ear */}
                <div className="absolute -top-1 right-1 w-3 h-3 bg-orange-500 rounded-full"></div> {/* Ear */}
                <div className="absolute top-2 left-2 w-1 h-1 bg-black rounded-full"></div> {/* Eye */}
                <div className="absolute top-2 right-2 w-1 h-1 bg-black rounded-full"></div> {/* Eye */}
                <div className="absolute bottom-8 left-3 w-2 h-6 bg-orange-400 rounded"></div> {/* Tail */}
              </div>
              
              {/* Magic elements */}
              <div className="absolute top-4 left-2 text-xs animate-float">✨</div>
              <div className="absolute top-6 right-8 text-xs animate-bounce-slow">🌟</div>
              <div className="absolute top-1 left-12 text-xs animate-float">⭐</div>
            </div>
          </div>
          
          <div className="text-sm text-gray-700 text-center leading-relaxed">
            &quot;Luna the fox discovered a magical garden where flowers danced and butterflies painted rainbows...&quot;
          </div>
          
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce-gentle"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce-gentle animation-delay-200"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce-gentle animation-delay-400"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
