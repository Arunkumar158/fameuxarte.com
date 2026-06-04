import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layouts/MainLayout";
import HomeNav from "@/components/home/HomeNav";
import { Price } from "@/components/shared/Price";
import { useArtworkImage } from "@/hooks/useArtworkImage";

type CartArtwork = {
  title: string;
  price: number;
  image_sign: string | null;
};

type CartItemProps = {
  item: {
    id: string;
    artwork_id: string;
    quantity: number;
    artwork: CartArtwork;
  };
  onRemove: (cartItemId: string) => Promise<void>;
  onUpdateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
};

const CartItemRow = ({ item, onRemove, onUpdateQuantity }: CartItemProps) => {
  const { imageUrl } = useArtworkImage(item.artwork.image_sign);
  const lineTotal = item.artwork.price * item.quantity;

  return (
    <article className="grid gap-4 rounded-[10px] border border-border-subtle bg-surface-2 p-4 transition-colors hover:border-gold/30 grid-cols-[80px_1fr] sm:grid-cols-[112px_1fr_auto] sm:items-center">
      <Link to={`/artworks/${item.artwork_id}`} className="group block h-20 w-20 sm:h-28 sm:w-28 overflow-hidden rounded-[8px] bg-surface-3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.artwork.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.src = "/placeholder.svg";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[11px] text-[#666]">No image</div>
        )}
      </Link>

      <div className="min-w-0">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[rgba(74,157,111,0.3)] bg-[rgba(74,157,111,0.1)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-verified">
          <ShieldCheck className="h-3 w-3" aria-hidden="true" />
          Reserved artwork
        </div>
        <h2 className="mb-2 line-clamp-2 text-[20px] font-medium tracking-[-0.02em] text-linen">
          <Link to={`/artworks/${item.artwork_id}`} className="transition-colors hover:text-gold">
            {item.artwork.title}
          </Link>
        </h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-[#666]">
          <span>Unit value: <span className="text-stone"><Price amount={item.artwork.price} /></span></span>
          <span>Line total: <span className="text-linen"><Price amount={lineTotal} /></span></span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 md:justify-end">
        <div className="flex h-10 items-center rounded-[6px] border border-border-subtle bg-obsidian">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-[6px] text-[#666] hover:bg-surface-3 hover:text-gold"
            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
            aria-label={`Decrease quantity for ${item.artwork.title}`}
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </Button>
          <span className="flex h-10 min-w-10 items-center justify-center border-x border-border-subtle px-3 text-[13px] font-medium text-linen">
            {item.quantity}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-[6px] text-[#666] hover:bg-surface-3 hover:text-gold"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            aria-label={`Increase quantity for ${item.artwork.title}`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-[6px] border border-border-subtle text-[#666] hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.artwork.title}`}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
};

const CartSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="grid gap-4 rounded-[10px] border border-border-subtle bg-surface-2 p-4 md:grid-cols-[112px_1fr_auto] md:items-center">
        <div className="h-28 animate-pulse rounded-[8px] bg-surface-3 md:w-28" />
        <div className="space-y-3">
          <div className="h-5 w-48 animate-pulse rounded bg-surface-3" />
          <div className="h-7 w-2/3 animate-pulse rounded bg-surface-3" />
          <div className="h-4 w-56 animate-pulse rounded bg-surface-3" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded bg-surface-3" />
      </div>
    ))}
  </div>
);

const Cart = () => {
  const { items, removeFromCart, updateQuantity, isLoading } = useCart();
  const total = items.reduce((sum, item) => sum + (item.artwork.price * item.quantity), 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <MainLayout>
      <div className="min-h-screen bg-obsidian text-linen">
        <div className="[&_nav_a[href='/cart']]:text-gold">
          <HomeNav />
        </div>

        <header className="border-b border-b-[0.5px] border-border-faint bg-obsidian px-4 sm:px-6 py-8 sm:py-12">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-gold">
                  <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                  Acquisition tray
                </div>
                <h1 className="mb-3 text-[34px] font-medium leading-[1.12] tracking-[-0.025em] text-linen md:text-[46px]">
                  Your Collection
                </h1>
                <p className="max-w-[600px] text-[14px] leading-[1.75] text-stone">
                  Review reserved artworks, adjust quantities, and proceed when you are ready to complete secure ownership.
                </p>
              </div>

              <Link
                to="/artworks"
                className="inline-flex h-10 items-center justify-center rounded-[6px] border border-gold/25 bg-gold/10 px-5 text-[12px] font-medium text-gold transition-colors hover:bg-gold hover:text-obsidian"
              >
                Continue browsing
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-8 grid gap-3 border-t border-t-[0.5px] border-border-faint pt-6 sm:grid-cols-3">
              <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-4">
                <div className="mb-1 text-[22px] font-medium tracking-[-0.02em] text-linen">{items.length}</div>
                <div className="text-[11px] text-[#666]">Reserved artworks</div>
              </div>
              <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-4">
                <div className="mb-1 text-[22px] font-medium tracking-[-0.02em] text-linen">{totalQuantity}</div>
                <div className="text-[11px] text-[#666]">Total pieces</div>
              </div>
              <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-4">
                <div className="mb-1 text-[22px] font-medium tracking-[-0.02em] text-gold">
                  <Price amount={total} />
                </div>
                <div className="text-[11px] text-[#666]">Total investment</div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
          {isLoading ? (
            <CartSkeleton />
          ) : items.length === 0 ? (
            <div className="mx-auto flex max-w-2xl flex-col items-center rounded-[10px] border border-border-subtle bg-surface-2 px-6 py-14 text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-gold">
                <ShoppingBag className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="mb-3 text-[26px] font-medium tracking-[-0.02em] text-linen">Your collection is empty</h2>
              <p className="mb-7 max-w-md text-[14px] leading-[1.7] text-stone">
                Reserve artworks from the catalogue and they will appear here for final review.
              </p>
              <Button asChild className="h-10 rounded-[6px] bg-gold px-5 text-[12px] font-medium text-obsidian hover:bg-linen">
                <Link to="/artworks">Browse Artworks</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
              <section className="space-y-4" aria-label="Reserved artworks">
                {items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onRemove={removeFromCart}
                    onUpdateQuantity={updateQuantity}
                  />
                ))}
              </section>

              <aside className="rounded-[10px] border border-border-subtle bg-surface-2 p-5 lg:sticky lg:top-6">
                <div className="mb-5 flex items-center gap-3 border-b border-b-[0.5px] border-border-faint pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-gold/20 bg-gold/10 text-gold">
                    <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-medium tracking-[-0.02em] text-linen">Acquisition Summary</h2>
                    <p className="text-[11px] text-[#666]">Secure checkout powered by Razorpay</p>
                  </div>
                </div>

                <div className="space-y-3 text-[13px]">
                  <div className="flex items-center justify-between text-stone">
                    <span>Reserved artworks</span>
                    <span className="text-linen">{items.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-stone">
                    <span>Total quantity</span>
                    <span className="text-linen">{totalQuantity}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-t-[0.5px] border-border-faint pt-4 text-stone">
                    <span>Total investment</span>
                    <span className="text-[22px] font-semibold tracking-[-0.02em] text-gold">
                      <Price amount={total} />
                    </span>
                  </div>
                </div>

                <Button asChild size="lg" className="mt-6 h-11 w-full rounded-[6px] bg-gold text-[12px] font-medium text-obsidian hover:bg-linen">
                  <Link to="/checkout">Proceed to Secure Acquisition</Link>
                </Button>

                <p className="mt-4 text-[11px] leading-[1.6] text-[#666]">
                  You can still update or remove reserved artworks before confirming ownership.
                </p>
              </aside>
            </div>
          )}
        </main>
      </div>
    </MainLayout>
  );
};

export default Cart;
