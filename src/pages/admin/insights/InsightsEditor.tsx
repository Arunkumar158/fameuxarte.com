import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function InsightsEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = id === 'new' || !id;

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    featured_image: "",
    category: "",
    tags: "",
    status: "draft",
    meta_title: "",
    meta_description: "",
    canonical_url: "",
    keywords: "",
    og_image: "",
    schema_type: "Article"
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] border p-4 rounded-md',
      },
    },
  });

  useEffect(() => {
    if (!isNew && id) {
      fetchInsight(id);
    }
  }, [id, isNew]);

  const fetchInsight = async (insightId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .eq('id', insightId)
      .single();

    if (error) {
      toast.error("Failed to load article");
      navigate('/admin/insights');
    } else if (data) {
      setFormData({
        title: data.title || "",
        slug: data.slug || "",
        excerpt: data.excerpt || "",
        featured_image: data.featured_image || "",
        category: data.category || "",
        tags: data.tags ? data.tags.join(', ') : "",
        status: data.status || "draft",
        meta_title: data.meta_title || "",
        meta_description: data.meta_description || "",
        canonical_url: data.canonical_url || "",
        keywords: data.keywords ? data.keywords.join(', ') : "",
        og_image: data.og_image || "",
        schema_type: data.schema_type || "Article"
      });
      if (editor) {
        editor.commands.setContent(data.content || "");
      }
    }
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleSave = async (saveAsStatus?: string) => {
    setIsSaving(true);
    
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    const keywordsArray = formData.keywords.split(',').map(k => k.trim()).filter(Boolean);
    const contentHtml = editor?.getHTML() || "";
    const finalStatus = saveAsStatus || formData.status;

    const payload = {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt,
      content: contentHtml,
      featured_image: formData.featured_image,
      category: formData.category,
      tags: tagsArray,
      status: finalStatus,
      meta_title: formData.meta_title,
      meta_description: formData.meta_description,
      canonical_url: formData.canonical_url,
      keywords: keywordsArray,
      og_image: formData.og_image,
      schema_type: formData.schema_type,
      author_id: user?.id,
      published_at: finalStatus === 'published' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };

    let result;
    if (isNew) {
      result = await supabase.from('insights').insert([payload]).select().single();
    } else {
      result = await supabase.from('insights').update(payload).eq('id', id).select().single();
    }

    if (result.error) {
      toast.error(result.error.message);
    } else {
      toast.success("Article saved successfully");
      if (isNew && result.data) {
        navigate(`/admin/insights/${result.data.id}`, { replace: true });
      }
    }
    
    setIsSaving(false);
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/insights')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-2xl font-bold text-slate-900">{isNew ? 'Create Article' : 'Edit Article'}</h2>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" disabled className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100 text-indigo-700">
            <Sparkles className="w-4 h-4 mr-2" /> Generate with AI (Soon)
          </Button>
          <Button onClick={() => handleSave('draft')} disabled={isSaving} variant="outline" className="border-slate-200 text-slate-700">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Draft
          </Button>
          <Button onClick={() => handleSave('published')} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input className="bg-white text-slate-900 border-slate-200" id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="Enter article title" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="slug">Slug</Label>
                <Button variant="link" size="sm" className="h-auto p-0" onClick={generateSlug}>Generate from Title</Button>
              </div>
              <Input className="bg-white text-slate-900 border-slate-200" id="slug" name="slug" value={formData.slug} onChange={handleInputChange} placeholder="e.g. how-to-buy-art" />
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              {/* Tiptap Toolbar */}
              <div className="border rounded-t-md border-b-0 p-2 flex gap-2 bg-slate-50 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleBold().run()} className={editor?.isActive('bold') ? 'bg-slate-200' : ''}>Bold</Button>
                <Button variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleItalic().run()} className={editor?.isActive('italic') ? 'bg-slate-200' : ''}>Italic</Button>
                <Button variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={editor?.isActive('heading', { level: 2 }) ? 'bg-slate-200' : ''}>H2</Button>
                <Button variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className={editor?.isActive('heading', { level: 3 }) ? 'bg-slate-200' : ''}>H3</Button>
                <Button variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={editor?.isActive('bulletList') ? 'bg-slate-200' : ''}>Bullet List</Button>
                <Button variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={editor?.isActive('blockquote') ? 'bg-slate-200' : ''}>Quote</Button>
              </div>
              <EditorContent editor={editor} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea className="bg-white text-slate-900 border-slate-200" id="excerpt" name="excerpt" value={formData.excerpt} onChange={handleInputChange} rows={3} placeholder="Brief summary of the article" />
            </div>
          </div>
          
          {/* SEO Section */}
          <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-900">SEO Configuration</h3>
              <Button variant="outline" size="sm" disabled className="text-indigo-600 border-indigo-200">
                <Sparkles className="w-3 h-3 mr-1" /> SEO Optimize (Soon)
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input className="bg-white text-slate-900 border-slate-200" id="meta_title" name="meta_title" value={formData.meta_title} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="canonical_url">Canonical URL</Label>
                <Input className="bg-white text-slate-900 border-slate-200" id="canonical_url" name="canonical_url" value={formData.canonical_url} onChange={handleInputChange} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Button variant="link" size="sm" className="h-auto p-0" disabled>Generate (Soon)</Button>
              </div>
              <Textarea className="bg-white text-slate-900 border-slate-200" id="meta_description" name="meta_description" value={formData.meta_description} onChange={handleInputChange} rows={2} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (comma separated)</Label>
              <Input className="bg-white text-slate-900 border-slate-200" id="keywords" name="keywords" value={formData.keywords} onChange={handleInputChange} placeholder="art, investment, original paintings" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="og_image">Open Graph Image URL</Label>
                <Input className="bg-white text-slate-900 border-slate-200" id="og_image" name="og_image" value={formData.og_image} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>Schema Type</Label>
                <Select className="bg-white text-slate-900 border-slate-200" value={formData.schema_type} onValueChange={(v) => handleSelectChange('schema_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Article">Article</SelectItem>
                    <SelectItem value="BlogPosting">BlogPosting</SelectItem>
                    <SelectItem value="NewsArticle">NewsArticle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">

          <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
            <h3 className="font-semibold border-b pb-2 text-slate-900">Categorization</h3>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input className="bg-white text-slate-900 border-slate-200" id="category" name="category" value={formData.category} onChange={handleInputChange} placeholder="e.g. Art Market" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input className="bg-white text-slate-900 border-slate-200" id="tags" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="e.g. guide, tips" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
            <h3 className="font-semibold border-b pb-2 text-slate-900">Media</h3>
            <div className="space-y-2">
              <Label htmlFor="featured_image">Featured Image URL</Label>
              <Input className="bg-white text-slate-900 border-slate-200" id="featured_image" name="featured_image" value={formData.featured_image} onChange={handleInputChange} />
              {formData.featured_image && (
                <div className="mt-2 aspect-video rounded-md overflow-hidden border">
                  <img src={formData.featured_image} alt="Featured" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
