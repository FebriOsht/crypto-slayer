"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Upload, Send, Trash2, Edit, X, CheckCircle, AlertTriangle, XCircle, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  
  // State untuk Mode Edit
  const [editingId, setEditingId] = useState<string | null>(null);

  // State untuk Custom Popup
  const [popup, setPopup] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ show: false, type: 'success', title: '', message: '' });

  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "news",
    image_url: ""
  });
  const [file, setFile] = useState<File | null>(null);
  
  // State untuk Preview Gambar
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // 1. Fetch data saat halaman dibuka
  useEffect(() => {
    fetchPosts();
  }, []);

  // Effect untuk mengurus Preview Gambar (File Baru vs Gambar Lama)
  useEffect(() => {
    if (file) {
      // Jika ada file baru dipilih user, buat URL preview local
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Cleanup untuk mencegah memory leak
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      // Jika tidak ada file baru, pakai URL dari form (gambar lama jika ada)
      setPreviewUrl(form.image_url);
    }
  }, [file, form.image_url]);

  const fetchPosts = async () => {
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    if (data) setPosts(data);
  };

  // --- HELPER POPUP ---
  const closePopup = () => setPopup(prev => ({ ...prev, show: false }));

  const showSuccess = (msg: string) => {
    setPopup({ 
      show: true, 
      type: 'success', 
      title: 'SUCCESS', 
      message: msg 
    });
    // Auto close untuk sukses
    setTimeout(() => setPopup(prev => ({ ...prev, show: false })), 2000);
  };

  const showError = (msg: string) => {
    setPopup({ 
      show: true, 
      type: 'error', 
      title: 'ERROR OCCURRED', 
      message: msg 
    });
  };

  const showConfirm = (msg: string, onConfirmAction: () => void) => {
    setPopup({ 
      show: true, 
      type: 'confirm', 
      title: 'CONFIRM ACTION', 
      message: msg,
      onConfirm: onConfirmAction
    });
  };

  // 2. Fungsi Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = form.image_url;

      // Jika ada file baru diupload
      if (file) {
        const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
        const { error: uploadError } = await supabase.storage.from("slayer-media").upload(fileName, file);
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage.from("slayer-media").getPublicUrl(fileName);
        finalImageUrl = urlData.publicUrl;
      }

      if (editingId) {
        // --- MODE UPDATE ---
        const { error } = await supabase
          .from("posts")
          .update({
            title: form.title,
            content: form.content,
            category: form.category,
            image_url: finalImageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId);

        if (error) throw error;
        showSuccess("Postingan berhasil di-update! 📝");
      } else {
        // --- MODE CREATE ---
        const { error } = await supabase.from("posts").insert({
          title: form.title,
          content: form.content,
          category: form.category,
          image_url: finalImageUrl,
        });

        if (error) throw error;
        showSuccess("Postingan baru berhasil diterbitkan! 🚀");
      }

      resetForm();
      fetchPosts();
      
    } catch (error: any) {
      showError(error.message || "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Fungsi Delete (Trigger Popup Konfirmasi dulu)
  const handleDeleteClick = (id: string) => {
    showConfirm("Apakah anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.", async () => {
        // Logic penghapusan dijalankan jika user klik Confirm
        const { error } = await supabase.from("posts").delete().eq("id", id);
        if (!error) {
          setPosts(prev => prev.filter((p) => p.id !== id));
          showSuccess("Data berhasil dimusnahkan.");
        } else {
          showError("Gagal menghapus data.");
        }
    });
  };

  // 4. Fungsi Edit
  const handleEditClick = (post: any) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      content: post.content,
      category: post.category,
      image_url: post.image_url || ""
    });
    // Reset file input saat edit
    setFile(null); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ title: "", content: "", category: "news", image_url: "" });
    setFile(null);
    setPreviewUrl("");
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono relative">
      
      {/* --- CUSTOM POPUP MODAL --- */}
      {popup.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200 relative overflow-hidden">
             
             {/* Glow Effect Background based on Type */}
             <div className={`absolute top-0 left-0 w-full h-1 ${
                popup.type === 'success' ? 'bg-green-500' : 
                popup.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'
             }`}></div>
             
             <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className={`mb-4 p-3 rounded-full bg-slate-800 border ${
                   popup.type === 'success' ? 'border-green-500/30 text-green-400' : 
                   popup.type === 'error' ? 'border-red-500/30 text-red-400' : 'border-yellow-500/30 text-yellow-400'
                }`}>
                   {popup.type === 'success' && <CheckCircle size={32} />}
                   {popup.type === 'error' && <XCircle size={32} />}
                   {popup.type === 'confirm' && <AlertTriangle size={32} />}
                </div>

                <h3 className="text-xl font-bold mb-2 tracking-wide text-white">
                  {popup.title}
                </h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  {popup.message}
                </p>

                {/* Buttons */}
                <div className="flex gap-3 w-full">
                  {popup.type === 'confirm' ? (
                    <>
                      <button 
                        onClick={closePopup}
                        className="flex-1 py-2 px-4 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors font-bold text-sm"
                      >
                        BATAL
                      </button>
                      <button 
                        onClick={() => {
                          if (popup.onConfirm) popup.onConfirm();
                          closePopup();
                        }}
                        className="flex-1 py-2 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-bold text-sm shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                      >
                        HAPUS
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={closePopup}
                      className="w-full py-2.5 px-4 rounded-lg bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 transition-all font-bold text-sm"
                    >
                      TUTUP
                    </button>
                  )}
                </div>
             </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        
        {/* --- FORM SECTION --- */}
        <div className="border border-gray-800 p-8 rounded-xl bg-gray-900/50 mb-12">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-red-500 flex items-center gap-2">
              {editingId ? "✏️ EDIT POSTINGAN" : "⚔️ BUAT POST BARU"}
            </h1>
            {editingId && (
              <button onClick={resetForm} className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
                <X size={14}/> Batal Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="md:col-span-2">
                  <label className="block text-xs uppercase text-gray-500 mb-1">Judul</label>
                  <input
                    type="text" required
                    className="w-full bg-gray-950 border border-gray-800 rounded p-3 focus:border-red-500 outline-none transition-colors text-white"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
               </div>
               <div>
                  <label className="block text-xs uppercase text-gray-500 mb-1">Kategori</label>
                  <select
                    className="w-full bg-gray-950 border border-gray-800 rounded p-3 outline-none text-white"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="news">News</option>
                    <option value="btc">BTC Analysis</option>
                    <option value="alt">Altcoins</option>
                  </select>
               </div>
            </div>

            <div>
              <label className="block text-xs uppercase text-gray-500 mb-1">Konten Full</label>
              <textarea
                required rows={8}
                className="w-full bg-gray-950 border border-gray-800 rounded p-3 focus:border-red-500 outline-none transition-colors text-white"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </div>

            {/* Bagian Upload Gambar dengan Preview */}
            <div>
              <label className="block text-xs uppercase text-gray-500 mb-1">Gambar</label>
              
              {/* Preview Area */}
              {previewUrl ? (
                <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 group">
                  <Image 
                    src={previewUrl} 
                    alt="Preview" 
                    fill 
                    className="object-contain" // Pakai contain agar gambar utuh terlihat
                  />
                  {/* Overlay untuk Ganti Gambar */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-bold flex items-center gap-2">
                      <ImageIcon /> Ganti Gambar di Bawah
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-32 mb-4 rounded-lg border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600 bg-slate-900/50">
                  <ImageIcon size={32} className="mb-2 opacity-50" />
                  <span className="text-xs">Preview gambar akan muncul di sini</span>
                </div>
              )}

              <input 
                type="file" 
                accept="image/*" // Hanya terima file gambar
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
              />
              
              {form.image_url && !file && (
                <p className="text-xs text-green-500 flex items-center gap-1 mt-2"><CheckCircle size={12}/> Gambar saat ini tersimpan.</p>
              )}
            </div>

            <button type="submit" disabled={loading} className={`w-full font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg ${editingId ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20' : 'bg-red-600 hover:bg-red-700 shadow-red-900/20'}`}>
              {loading ? "Processing..." : editingId ? "UPDATE POST" : "PUBLISH POST"}
            </button>
          </form>
        </div>

        {/* --- LIST MANAGEMENT SECTION --- */}
        <h2 className="text-xl font-bold mb-4 text-gray-400">Arsip Postingan</h2>
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center gap-4 bg-gray-900 border border-gray-800 p-4 rounded-lg hover:border-gray-600 transition-colors group">
               {post.image_url && (
                 <div className="w-16 h-16 relative flex-shrink-0">
                    <Image src={post.image_url} alt="img" fill className="object-cover rounded"/>
                 </div>
               )}
               <div className="flex-grow">
                 <h3 className="font-bold text-white truncate group-hover:text-red-500 transition-colors">{post.title}</h3>
                 <div className="flex gap-2 text-xs text-gray-500 mt-1">
                   <span className="uppercase bg-gray-800 px-2 rounded border border-gray-700">{post.category}</span>
                   <span>{new Date(post.created_at).toLocaleDateString()}</span>
                   {post.updated_at && <span className="text-blue-400">(Edited)</span>}
                 </div>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => handleEditClick(post)} className="p-2 bg-blue-900/20 text-blue-400 rounded hover:bg-blue-600 hover:text-white transition-colors" title="Edit">
                   <Edit size={18}/>
                 </button>
                 {/* Update Handle Delete Call */}
                 <button onClick={() => handleDeleteClick(post.id)} className="p-2 bg-red-900/20 text-red-400 rounded hover:bg-red-600 hover:text-white transition-colors" title="Hapus">
                   <Trash2 size={18}/>
                 </button>
               </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}