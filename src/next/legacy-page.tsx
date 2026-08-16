"use client";

import React from "react";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Artworks from "@/pages/Artworks";
import Search from "@/pages/Search";
import ArtworkDetails from "@/pages/ArtworkDetails";
import ForArtists from "@/pages/ForArtists";
import Artists from "@/pages/Artists";
import ArtistDetails from "@/pages/ArtistDetails";
import Collections from "@/pages/Collections";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import LikedItems from "@/pages/LikedItems";
import OrderSuccess from "@/pages/OrderSuccess";
import PaymentFailed from "@/pages/PaymentFailed";
import ContactUs from "@/pages/ContactUs";
import FAQ from "@/pages/FAQ";
import OurStory from "@/pages/OurStory";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import CancellationsAndRefunds from "@/pages/CancellationsAndRefunds";
import CertificateVerify from "@/pages/CertificateVerify";
import CollectionPage from "@/pages/discovery/CollectionPage";
import CategoryPage from "@/pages/discovery/CategoryPage";
import StylePage from "@/pages/discovery/StylePage";
import MediumPage from "@/pages/discovery/MediumPage";
import SubjectPage from "@/pages/discovery/SubjectPage";
import LocationPage from "@/pages/discovery/LocationPage";
import ColorPage from "@/pages/discovery/ColorPage";
import ProgrammaticDiscoveryPage from "@/pages/discovery/ProgrammaticDiscoveryPage";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import OrdersAdmin from "@/pages/admin/Orders";
import ArtworksAdmin from "@/pages/admin/Artworks";
import ArtistsAdmin from "@/pages/admin/Artists";
import VerificationManagement from "@/pages/admin/VerificationManagement";
import CollectionsAdmin from "@/pages/admin/Collections";
import SEOAdmin from "@/pages/admin/SEO";
import AnalyticsAdmin from "@/pages/admin/Analytics";
import SettingsAdmin from "@/pages/admin/Settings";
import InsightsList from "@/pages/admin/insights/InsightsList";
import InsightsEditor from "@/pages/admin/insights/InsightsEditor";
import { ArtistRoute } from "@/components/artist/ArtistRoute";
import { ArtistLayout } from "@/components/artist/ArtistLayout";
import ArtistDashboard from "@/pages/artist/Dashboard";
import ArtistAnalytics from "@/pages/artist/Analytics";
import ArtistArtworksList from "@/pages/artist/ArtworksList";
import ArtworkEditor from "@/pages/artist/ArtworkEditor";
import ArtistCollectionsList from "@/pages/artist/CollectionsList";
import CollectionEditor from "@/pages/artist/CollectionEditor";
import ArtistPortfolioPreview from "@/pages/artist/PortfolioPreview";
import ArtistSettings from "@/pages/artist/Settings";
import ArtistVerificationCenter from "@/pages/artist/VerificationCenter";
import ArtistOrdersList from "@/pages/artist/OrdersList";
import ArtistOrderDetails from "@/pages/artist/OrderDetails";
import { CollectorRoute } from "@/components/collector/CollectorRoute";
import { CollectorLayout } from "@/components/collector/CollectorLayout";
import CollectorDashboard from "@/pages/collector/Dashboard";
import CollectorCollection from "@/pages/collector/Collection";
import CollectorWishlist from "@/pages/collector/Wishlist";
import CollectorOrders from "@/pages/collector/Orders";
import CollectorCertificates from "@/pages/collector/Certificates";
import CollectorFollowing from "@/pages/collector/Following";
import CollectorSavedCollections from "@/pages/collector/SavedCollections";
import CollectorNotifications from "@/pages/collector/Notifications";
import CollectorAddresses from "@/pages/collector/Addresses";
import CollectorSettings from "@/pages/collector/Settings";
import NotFound from "@/pages/NotFound";

const pages = {
  home: Index,
  auth: Auth,
  forgotPassword: ForgotPassword,
  resetPassword: ResetPassword,
  cart: Cart,
  checkout: Checkout,
  artworks: Artworks,
  search: Search,
  artworkDetails: ArtworkDetails,
  forArtists: ForArtists,
  artists: Artists,
  artistDetails: ArtistDetails,
  collections: Collections,
  blog: Blog,
  blogPost: BlogPost,
  likedItems: LikedItems,
  orderSuccess: OrderSuccess,
  paymentFailed: PaymentFailed,
  contact: ContactUs,
  faq: FAQ,
  ourStory: OurStory,
  privacyPolicy: PrivacyPolicy,
  termsOfService: TermsOfService,
  cancellationsAndRefunds: CancellationsAndRefunds,
  certificateVerify: CertificateVerify,
  collectionDiscovery: CollectionPage,
  categoryDiscovery: CategoryPage,
  styleDiscovery: StylePage,
  mediumDiscovery: MediumPage,
  subjectDiscovery: SubjectPage,
  locationDiscovery: LocationPage,
  colorDiscovery: ColorPage,
  programmaticDiscovery: ProgrammaticDiscoveryPage,
  notFound: NotFound,
} as const;

const adminPages = {
  dashboard: AdminDashboard,
  orders: OrdersAdmin,
  artworks: ArtworksAdmin,
  artists: ArtistsAdmin,
  verification: VerificationManagement,
  collections: CollectionsAdmin,
  seo: SEOAdmin,
  analytics: AnalyticsAdmin,
  settings: SettingsAdmin,
  insights: InsightsList,
  insightEditor: InsightsEditor,
} as const;

const artistPages = {
  dashboard: ArtistDashboard,
  analytics: ArtistAnalytics,
  artworks: ArtistArtworksList,
  artworkNew: ArtworkEditor,
  artworkEdit: ArtworkEditor,
  collections: ArtistCollectionsList,
  collectionNew: CollectionEditor,
  collectionEdit: CollectionEditor,
  portfolio: ArtistPortfolioPreview,
  settings: ArtistSettings,
  verification: ArtistVerificationCenter,
  orders: ArtistOrdersList,
  orderDetails: ArtistOrderDetails,
} as const;

const collectorPages = {
  dashboard: CollectorDashboard,
  collection: CollectorCollection,
  wishlist: CollectorWishlist,
  orders: CollectorOrders,
  certificates: CollectorCertificates,
  following: CollectorFollowing,
  savedCollections: CollectorSavedCollections,
  notifications: CollectorNotifications,
  addresses: CollectorAddresses,
  settings: CollectorSettings,
} as const;

type PageKey = keyof typeof pages;
type AdminKey = keyof typeof adminPages;
type ArtistKey = keyof typeof artistPages;
type CollectorKey = keyof typeof collectorPages;

export function LegacyPage({ name }: { name: PageKey }) {
  const Component = pages[name];
  return <Component />;
}

export function AdminPage({ name }: { name: AdminKey }) {
  const Component = adminPages[name];
  return <AdminRoute><AdminLayout><Component /></AdminLayout></AdminRoute>;
}

export function ArtistPage({ name }: { name: ArtistKey }) {
  const Component = artistPages[name];
  return <ArtistRoute><ArtistLayout><Component /></ArtistLayout></ArtistRoute>;
}

export function CollectorPage({ name }: { name: CollectorKey }) {
  const Component = collectorPages[name];
  return <CollectorRoute><CollectorLayout><Component /></CollectorLayout></CollectorRoute>;
}
