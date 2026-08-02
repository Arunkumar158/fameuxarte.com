import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Camera, 
  Loader2, 
  Save, 
  MapPin, 
  Globe, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Youtube,
  ImageIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFormDraft } from "@/hooks/useFormDraft";

const DRAFT_KEY = "fameuxarte:artist-profile-draft";

interface ProfileDraft {
  fullName: string;
  country: string;
  city: string;
  website: string;
  yearsExperience: string;
  bio: string;
  artistStatement: string;
  mediums: string;
  styles: string;
  instagram: string;
  pinterest: string;
  facebook: string;
  linkedin: string;
  youtube: string;
}

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  
  // Basic Info
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  
  // Bio & Statement
  const [bio, setBio] = useState("");
  const [artistStatement, setArtistStatement] = useState("");
  
  // Tags (comma separated)
  const [mediums, setMediums] = useState("");
  const [styles, setStyles] = useState("");
  
  // Social Links
  const [instagram, setInstagram] = useState("");
  const [pinterest, setPinterest] = useState("");
  const [facebook, setFacebook] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [youtube, setYoutube] = useState("");
  
  // Images
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // ─── Draft persistence (survives mobile app switches) ───────────────────────
  const { draft, setDraft, clearDraft, hasDraft } = useFormDraft<ProfileDraft>(DRAFT_KEY);
  const draftRestoredRef = useRef(false);

  // Restore draft from localStorage on first mount (before profile loads)
  useEffect(() => {
    if (!draftRestoredRef.current && hasDraft && draft) {
      draftRestoredRef.current = true;
      if (draft.fullName !== undefined) setFullName(draft.fullName);
      if (draft.country !== undefined) setCountry(draft.country);
      if (draft.city !== undefined) setCity(draft.city);
      if (draft.website !== undefined) setWebsite(draft.website);
      if (draft.yearsExperience !== undefined) setYearsExperience(draft.yearsExperience);
      if (draft.bio !== undefined) setBio(draft.bio);
      if (draft.artistStatement !== undefined) setArtistStatement(draft.artistStatement);
      if (draft.mediums !== undefined) setMediums(draft.mediums);
      if (draft.styles !== undefined) setStyles(draft.styles);
      if (draft.instagram !== undefined) setInstagram(draft.instagram);
      if (draft.pinterest !== undefined) setPinterest(draft.pinterest);
      if (draft.facebook !== undefined) setFacebook(draft.facebook);
      if (draft.linkedin !== undefined) setLinkedin(draft.linkedin);
      if (draft.youtube !== undefined) setYoutube(draft.youtube);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ["artist-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      // Only overwrite from server if the user has no unsaved local draft.
      // This prevents server data from wiping out edits the user typed before
      // the query returned (common on slow mobile connections).
      if (!hasDraft) {
        setFullName(profile.full_name || "");
        setCountry(profile.country || "");
        setCity(profile.city || "");
        setWebsite(profile.website || "");
        setYearsExperience(profile.years_of_experience?.toString() || "");
        
        setBio(profile.bio || "");
        setArtistStatement(profile.artist_statement || "");
        
        setMediums(profile.mediums?.join(", ") || "");
        setStyles(profile.art_styles?.join(", ") || "");
        
        const socials = profile.social_links as Record<string, string> || {};
        setInstagram(socials.instagram || "");
        setPinterest(socials.pinterest || "");
        setFacebook(socials.facebook || "");
        setLinkedin(socials.linkedin || "");
        setYoutube(socials.youtube || "");
      }
      
      setAvatarUrl(profile.avatar_url || null);
      setCoverImage(profile.cover_image || null);
    }
  }, [profile]); // hasDraft intentionally omitted – we only want this to react to profile changes

  // Auto-save all text fields to localStorage draft whenever they change
  useEffect(() => {
    setDraft({
      fullName,
      country,
      city,
      website,
      yearsExperience,
      bio,
      artistStatement,
      mediums,
      styles,
      instagram,
      pinterest,
      facebook,
      linkedin,
      youtube,
    });
  }, [fullName, country, city, website, yearsExperience, bio, artistStatement, mediums, styles, instagram, pinterest, facebook, linkedin, youtube, setDraft]);

  useEffect(() => {
    if (avatarFile) {
      const url = URL.createObjectURL(avatarFile);
      setAvatarPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [avatarFile]);

  useEffect(() => {
    if (coverFile) {
      const url = URL.createObjectURL(coverFile);
      setCoverPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [coverFile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      let finalAvatarUrl = avatarUrl;
      let finalCoverImage = coverImage;

      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${user.id}/avatar_${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("artworks").upload(path, avatarFile, { upsert: true });
        if (error) throw error;
        
        const { data } = supabase.storage.from("artworks").getPublicUrl(path);
        finalAvatarUrl = data.publicUrl;
      }

      if (coverFile) {
        const ext = coverFile.name.split(".").pop();
        const path = `${user.id}/cover_${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("artworks").upload(path, coverFile, { upsert: true });
        if (error) throw error;
        finalCoverImage = path;
      }

      const socialLinks = {
        ...(instagram && { instagram }),
        ...(pinterest && { pinterest }),
        ...(facebook && { facebook }),
        ...(linkedin && { linkedin }),
        ...(youtube && { youtube })
      };

      const payload = {
        full_name: fullName.trim() || null,
        country: country.trim() || null,
        city: city.trim() || null,
        website: website.trim() || null,
        years_of_experience: parseInt(yearsExperience) || null,
        bio: bio.trim() || null,
        artist_statement: artistStatement.trim() || null,
        mediums: mediums.split(",").map(s => s.trim()).filter(Boolean),
        art_styles: styles.split(",").map(s => s.trim()).filter(Boolean),
        social_links: socialLinks,
        avatar_url: finalAvatarUrl,
        cover_image: finalCoverImage,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);
      
      if (error) throw error;

      // Clear the local draft now that the server has accepted the changes
      clearDraft();

      toast({
        title: "Profile Updated",
        description: "Your professional profile has been saved.",
      });
      
      refetch();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was an error updating your profile.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-linen">Professional Profile</h1>
        <p className="mt-1 text-sm text-stone">This information is displayed publicly on your portfolio to build trust with collectors.</p>
      </div>

      <div className="space-y-6">
        {/* Cover Image & Avatar */}
        <section className="overflow-hidden rounded-[8px] border border-border-subtle bg-surface-2">
          <div className="relative h-48 w-full bg-surface-3">
            {(coverPreview || coverImage) ? (
              <img 
                src={coverPreview || `https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/public/artworks/${coverImage}`} 
                alt="Cover" 
                className="h-full w-full object-cover" 
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageIcon className="h-8 w-8 text-stone/30" />
              </div>
            )}
            
            <button 
              onClick={() => coverInputRef.current?.click()}
              className="absolute bottom-4 right-4 flex items-center gap-2 rounded-[6px] bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
            >
              <Camera className="h-4 w-4" />
              Update Cover
            </button>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
          </div>

          <div className="flex flex-col px-6 pb-6 sm:flex-row sm:items-end gap-6 relative">
            <div className="relative -mt-12 inline-block">
              <Avatar className="h-24 w-24 border-4 border-surface-2 bg-surface-3">
                <AvatarImage src={avatarPreview || avatarUrl || ""} />
                <AvatarFallback className="bg-gold/10 text-gold text-2xl">{fullName?.charAt(0) || "A"}</AvatarFallback>
              </Avatar>
              <button 
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-gold text-obsidian shadow-lg hover:bg-linen transition-colors"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            
            <div className="flex-1 space-y-1">
              <h2 className="text-lg font-medium text-linen">{fullName || "Artist Name"}</h2>
              <p className="text-sm text-stone">{city}{city && country ? ', ' : ''}{country}</p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <section className="rounded-[8px] border border-border-subtle bg-surface-2 p-5">
              <h3 className="mb-4 text-[14px] font-medium text-linen">Basic Details</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[12px] text-stone">Display Name</Label>
                  <Input value={fullName} onChange={e => setFullName(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-[12px] text-stone">Country</Label>
                    <Input value={country} onChange={e => setCountry(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[12px] text-stone">City</Label>
                    <Input value={city} onChange={e => setCity(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-[12px] text-stone">Years of Experience</Label>
                    <Input type="number" value={yearsExperience} onChange={e => setYearsExperience(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[12px] text-stone">Website</Label>
                    <Input placeholder="https://" value={website} onChange={e => setWebsite(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[8px] border border-border-subtle bg-surface-2 p-5">
              <h3 className="mb-4 text-[14px] font-medium text-linen">About the Artist</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[12px] text-stone">Biography (Short)</Label>
                  <Textarea rows={3} placeholder="A short introduction..." value={bio} onChange={e => setBio(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-[12px] text-stone">Artist Statement</Label>
                  <Textarea rows={6} placeholder="Your philosophy, techniques, and what inspires you..." value={artistStatement} onChange={e => setArtistStatement(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
                </div>
              </div>
            </section>

            <section className="rounded-[8px] border border-border-subtle bg-surface-2 p-5">
              <h3 className="mb-4 text-[14px] font-medium text-linen">Artistic Focus</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[12px] text-stone">Mediums (comma separated)</Label>
                  <Input placeholder="Oil, Acrylic, Bronze, Digital..." value={mediums} onChange={e => setMediums(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-[12px] text-stone">Styles (comma separated)</Label>
                  <Input placeholder="Abstract, Fine Art, Contemporary..." value={styles} onChange={e => setStyles(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-[8px] border border-border-subtle bg-surface-2 p-5">
              <h3 className="mb-4 text-[14px] font-medium text-linen">Social Links</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Instagram className="h-4 w-4 text-stone shrink-0" />
                  <Input placeholder="Instagram URL" value={instagram} onChange={e => setInstagram(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-stone shrink-0" /> {/* Pinterest Placeholder */}
                  <Input placeholder="Pinterest URL" value={pinterest} onChange={e => setPinterest(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
                </div>
                <div className="flex items-center gap-3">
                  <Facebook className="h-4 w-4 text-stone shrink-0" />
                  <Input placeholder="Facebook URL" value={facebook} onChange={e => setFacebook(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
                </div>
                <div className="flex items-center gap-3">
                  <Linkedin className="h-4 w-4 text-stone shrink-0" />
                  <Input placeholder="LinkedIn URL" value={linkedin} onChange={e => setLinkedin(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
                </div>
                <div className="flex items-center gap-3">
                  <Youtube className="h-4 w-4 text-stone shrink-0" />
                  <Input placeholder="YouTube URL" value={youtube} onChange={e => setYoutube(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
                </div>
              </div>
            </section>
            
            <div className="sticky top-6">
              <Button 
                onClick={handleSave} 
                disabled={isSaving} 
                className="w-full bg-gold text-obsidian hover:bg-linen"
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
