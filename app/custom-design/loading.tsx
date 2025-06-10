import { Loader2 } from "lucide-react"

export default function CustomDesignLoading() {
  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 text-purple-600 animate-spin mb-4" />
        <h2 className="text-xl font-medium text-gray-700">Yükleniyor...</h2>
        <p className="text-gray-500">Özel tasarım sayfası hazırlanıyor</p>
      </div>
    </div>
  )
}
