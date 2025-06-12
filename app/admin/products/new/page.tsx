"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Label,
  Input,
  Textarea,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Button,
} from "@/components/ui";

interface Category {
  id: string;
  name: string;
}

interface ProductData {
  name: string;
  price: string;
  description: string;
  category_id: string;
  video_360_url: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [productData, setProductData] = useState<ProductData>({
    name: "",
    price: "",
    description: "",
    category_id: "",
    video_360_url: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load real categories from the Neon DB
  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => {
        if (!res.ok) throw new Error("Kategori yüklenemedi");
        return res.json();
      })
      .then((data: Category[]) => {
        setCategories(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Kategoriler yüklenemedi");
      })
      .finally(() => setLoadingCats(false));
  }, []);

  // File upload helper
  async function uploadFile(file: File, folder: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Dosya yükleme hatası");
    const json = await res.json();
    return json.url as string;
  }

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file, "product-videos");
      setProductData((p) => ({ ...p, video_360_url: url }));
      toast.success("360° video yüklendi");
    } catch (err) {
      console.error(err);
      toast.error("Video yükleme hatası");
    }
  };

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
        const err = await res.json();
        throw new Error(err.message || "Ürün kaydedilirken hata oluştu");
      }
      toast.success("Ürün başarıyla kaydedildi");
      router.push("/admin/products");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
      <div>
        <Label htmlFor="name">Ürün Adı *</Label>
        <Input
          id="name"
          value={productData.name}
          onChange={(e) => setProductData((p) => ({ ...p, name: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="price">Fiyat (₺) *</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          value={productData.price}
          onChange={(e) => setProductData((p) => ({ ...p, price: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Açıklama</Label>
        <Textarea
          id="description"
          rows={4}
          value={productData.description}
          onChange={(e) => setProductData((p) => ({ ...p, description: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="category_id">Kategori *</Label>
        <Select
          value={productData.category_id}
          onValueChange={(value) => setProductData((p) => ({ ...p, category_id: value }))}
          disabled={loadingCats}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingCats ? "Yükleniyor..." : "Kategori seçin"} />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="video360">360° Video</Label>
        <Input id="video360" type="file" accept="video/*" onChange={handleVideoChange} />
        {productData.video_360_url && (
          <p className="mt-2 text-sm text-green-600">
            Yüklendi: <a href={productData.video_360_url} target="_blank" rel="noreferrer">Videoyu Görüntüle</a>
          </p>
        )}
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Kaydediliyor..." : "Ürünü Kaydet"}
        </Button>
      </div>
    </form>
  );
}
