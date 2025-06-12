"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
}

interface ProductData {
  name: string;
  price: string;
  description: string;
  category_id: string;
  images: string[];
  video_360_url: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [productData, setProductData] = useState<ProductData>({
    name: "",
    price: "",
    description: "",
    category_id: "",
    images: [],
    video_360_url: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Neon DB'den kategorileri çek
  useEffect(() => {
    fetch("/api/admin/categories")
      .then(res => {
        if (!res.ok) throw new Error("Kategori yüklenemedi");
        return res.json();
      })
      .then((data: Category[]) => setCategories(data))
      .catch(() => toast.error("Kategoriler yüklenemedi."))
      .finally(() => setLoadingCats(false));
  }, []);

  // Dosya yükleme fonksiyonu (hem resim hem video için)
  async function uploadFile(file: File, folder: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Dosya yükleme hatası");
    const json = await res.json();
    return json.url as string;
  }

  // Resim dosyalarını yükle
  const handleImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 3);
    if (files.length === 0) return;
    try {
      const urls = await Promise.all(files.map(f => uploadFile(f, "product-images")));
      setProductData(prev => ({ ...prev, images: urls }));
      toast.success("Resimler yüklendi");
    } catch {
      toast.error("Resim yükleme hatası");
    }
  };

  // Video dosyasını yükle
  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file, "product-videos");
      setProductData(prev => ({ ...prev, video_360_url: url }));
      toast.success("360° video yüklendi");
    } catch {
      toast.error("Video yükleme hatası");
    }
  };

  // Form gönder
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      if (!res.ok) {
        const errorRes = await res.json();
        throw new Error(errorRes.message || "Ürün kaydedilirken hata oluştu");
      }
      toast.success("Ürün başarıyla kaydedildi");
      router.push("/admin/products");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
      {/* Ürün Adı */}
      <div>
        <Label htmlFor="name">Ürün Adı *</Label>
        <Input
          id="name"
          value={productData.name}
          onChange={e => setProductData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      {/* Fiyat */}
      <div>
        <Label htmlFor="price">Fiyat (₺) *</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          value={productData.price}
          onChange={e => setProductData(prev => ({ ...prev, price: e.target.value }))}
          required
        />
      </div>

      {/* Açıklama */}
      <div>
        <Label htmlFor="description">Açıklama</Label>
        <Textarea
          id="description"
          rows={4}
          value={productData.description}
          onChange={e => setProductData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      {/* Resim Yükleme */}
      <div>
        <Label htmlFor="images">Ürün Resimleri (max 3)</Label>
        <Input
          id="images"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImagesChange}
        />
        {productData.images.length > 0 && (
          <ul className="mt-2 text-sm text-green-600 list-disc list-inside">
            {productData.images.map(url => (
              <li key={url}>
                <a href={url} target="_blank" rel="noreferrer">
                  {url.split('/').pop()}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Kategori */}
      <div>
        <Label htmlFor="category_id">Kategori *</Label>
        <Select
          value={productData.category_id}
          onValueChange={val => setProductData(prev => ({ ...prev, category_id: val }))}
          disabled={loadingCats}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingCats ? "Yükleniyor..." : "Kategori seçin"} />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 360° Video */}
      <div>
        <Label htmlFor="video360">360° Video</Label>
        <Input
          id="video360"
          type="file"
          accept="video/*"
          onChange={handleVideoChange}
        />
        {productData.video_360_url && (
          <p className="mt-2 text-sm text-green-600">
            Yüklendi: <a href={productData.video_360_url} target="_blank" rel="noreferrer">Videoyu Görüntüle</a>
          </p>
        )}
      </div>

      {/* Gönder Butonu */}
      <div className="pt-4">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Kaydediliyor..." : "Ürünü Kaydet"}
        </Button>
      </div>
    </form>
  );
}
