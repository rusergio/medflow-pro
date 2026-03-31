import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIcon,
  BrainIcon,
  HeartPulseIcon,
  MinusIcon,
  PillIcon,
  PlusIcon,
  ShoppingCartIcon,
  StethoscopeIcon,
  Trash2Icon,
  CreditCardIcon,
  WalletIcon,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  specialty: string;
  price: number;
  rx: boolean;
}

const SPECIALTIES = [
  'Todas',
  'Medicina Geral',
  'Cardiologia',
  'Psiquiatria',
  'Ortopedia',
  'Dermatologia',
];

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Paracetamol 1g',
    description: 'Analgésico e antipirético para alívio de dor e febre.',
    category: 'Dor e Febre',
    specialty: 'Medicina Geral',
    price: 3.9,
    rx: false,
  },
  {
    id: '2',
    name: 'Ibuprofeno 400mg',
    description: 'Analgésico e anti-inflamatório não esteroide.',
    category: 'Dor e Inflamação',
    specialty: 'Ortopedia',
    price: 4.5,
    rx: false,
  },
  {
    id: '3',
    name: 'Omeprazol 20mg',
    description: 'Protector gástrico para refluxo e azia frequente.',
    category: 'Estômago e Intestino',
    specialty: 'Medicina Geral',
    price: 6.2,
    rx: true,
  },
  {
    id: '4',
    name: 'Loratadina 10mg',
    description: 'Antialérgico para rinite, prurido e urticária.',
    category: 'Alergias',
    specialty: 'Dermatologia',
    price: 5.1,
    rx: false,
  },
  {
    id: '5',
    name: 'Soro Fisiológico 250ml',
    description: 'Higiene nasal e ocular diária.',
    category: 'Higiene',
    specialty: 'Medicina Geral',
    price: 2.3,
    rx: false,
  },
  {
    id: '6',
    name: 'Vitamina C 1000mg',
    description: 'Reforço do sistema imunitário e cansaço.',
    category: 'Vitaminas',
    specialty: 'Cardiologia',
    price: 7.9,
    rx: false,
  },
  {
    id: '7',
    name: 'Sertralina 50mg',
    description: 'Antidepressivo (venda condicionada a receita).',
    category: 'Estabilização do humor',
    specialty: 'Psiquiatria',
    price: 12.5,
    rx: true,
  },
];

interface CartItem {
  product: Product;
  qty: number;
}

type CheckoutStep = 'cart' | 'checkout1' | 'confirmation';
type PaymentMethod = 'card' | 'clinic';

const PatientPharmacy: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeSpecialty, setActiveSpecialty] = useState<string>('Todas');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('cart');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutConfirmed, setCheckoutConfirmed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    country: 'Portugal',
  });

  const cartWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isCartOpen) return;

    const onMouseDown = (e: MouseEvent) => {
      const wrapper = cartWrapperRef.current;
      if (!wrapper) return;
      const target = e.target as Node;
      if (!wrapper.contains(target)) setIsCartOpen(false);
    };

    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [isCartOpen]);

  useEffect(() => {
    if (!isCartOpen) {
      setCheckoutStep('cart');
      setCheckoutError(null);
      setCheckoutConfirmed(false);
    }
  }, [isCartOpen]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) {
        return prev.map((c) =>
          c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c,
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const changeQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.product.id === id ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0),
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((c) => c.product.id !== id));
  };

  const cartCount = useMemo(() => cart.reduce((sum, c) => sum + c.qty, 0), [cart]);
  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.qty, 0),
    [cart],
  );

  const filteredProducts = useMemo(
    () =>
      activeSpecialty === 'Todas'
        ? PRODUCTS
        : PRODUCTS.filter((p) => p.specialty === activeSpecialty),
    [activeSpecialty],
  );

  const requiredFieldsOk = () => {
    const required = [
      form.fullName.trim(),
      form.email.trim(),
      form.phone.trim(),
      form.addressLine1.trim(),
      form.city.trim(),
      form.postalCode.trim(),
      form.country.trim(),
      paymentMethod,
    ];
    return required.every(Boolean);
  };

  const submitCheckout = () => {
    setCheckoutError(null);
    setCheckoutConfirmed(false);

    if (!cart.length) {
      setCheckoutError('O seu carrinho está vazio.');
      return;
    }
    if (!requiredFieldsOk()) {
      setCheckoutError('Preencha todos os campos obrigatórios para continuar.');
      return;
    }

    // Simulação (sem backend nesta fase)
    setCheckoutConfirmed(true);
    setCheckoutStep('confirmation');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero / heading + illustration */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-6 md:gap-10">
        <div className="flex-1 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-emerald-700">
              Farmácia Online
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Bem-vindo à nossa <span className="text-emerald-600">Farmácia Online</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-xl">
            Compre medicamentos e produtos de saúde por especialidade, com apoio da equipa clínica
            e opções de pagamento flexíveis.
          </p>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-emerald-200 px-2.5 py-1 text-emerald-700 font-semibold">
              <StethoscopeIcon className="w-3.5 h-3.5" />
              Integrada com especialidades médicas
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-emerald-200 px-2.5 py-1 text-slate-700 font-semibold">
              <HeartPulseIcon className="w-3.5 h-3.5 text-rose-500" />
              Medicamentos de confiança
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-emerald-200 px-2.5 py-1 text-slate-700 font-semibold">
              <BrainIcon className="w-3.5 h-3.5 text-indigo-500" />
              Assistente IA para dúvidas
            </span>
          </div>
        </div>

        {/* Cart trigger + dropdown */}
        <div className="flex-1 flex items-center justify-end gap-4">
          <div ref={cartWrapperRef} className="relative">
            <button
              type="button"
              className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setIsCartOpen((v) => !v)}
            >
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <ShoppingCartIcon className="w-5 h-5" />
              </div>
              <div className="text-xs text-left">
                <p className="font-semibold text-slate-800">Carrinho</p>
                <p className="text-slate-500">
                  {cart.length === 0
                    ? 'Ainda não há produtos no carrinho.'
                    : `${cartCount} item(s) • ${total.toFixed(2)} €`}
                </p>
              </div>
            </button>

            {isCartOpen && (
              <div
                className="absolute right-0 mt-2 w-[92vw] sm:w-[420px] max-w-[420px] rounded-2xl border border-slate-200 bg-white shadow-lg p-4 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {checkoutStep === 'cart' && 'O seu carrinho'}
                    {checkoutStep === 'checkout1' && 'Pagamento - Dados'}
                    {checkoutStep === 'confirmation' && 'Pagamento concluído'}
                  </h3>
                  <button
                    type="button"
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900"
                    onClick={() => setIsCartOpen(false)}
                  >
                    Fechar
                  </button>
                </div>

                {cart.length === 0 && checkoutStep !== 'confirmation' ? (
                  <p className="text-xs text-slate-500">
                    Ainda não adicionou nenhum medicamento. Explore a lista ao lado e clique em
                    &quot;Adicionar&quot;.
                  </p>
                ) : (
                  <>
                    {checkoutStep === 'cart' && (
                      <>
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {cart.map((item) => (
                            <div
                              key={item.product.id}
                              className="flex items-start justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                            >
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-slate-800">
                                  {item.product.name}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  {item.qty} x {item.product.price.toFixed(2)} €
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => changeQty(item.product.id, -1)}
                                  className="p-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                                >
                                  <MinusIcon className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => changeQty(item.product.id, +1)}
                                  className="p-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                                >
                                  <PlusIcon className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.product.id)}
                                  className="p-1 rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500"
                                >
                                  <Trash2Icon className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-slate-100 mt-3">
                          <div className="flex items-center justify-between text-xs text-slate-600">
                            <span>Subtotal</span>
                            <span className="font-semibold text-slate-900">
                              {total.toFixed(2)} €
                            </span>
                          </div>

                          <div className="mt-2 space-y-2">
                            <button
                              type="button"
                              onClick={() => setCheckoutStep('checkout1')}
                              className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 text-white px-3 py-2 text-xs font-semibold hover:bg-slate-800 transition-colors disabled:opacity-60"
                            >
                              Continuar para pagamento
                            </button>
                            <p className="text-[11px] text-slate-500">
                              Vamos pedir alguns dados para finalizar a encomenda (simulação).
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    {checkoutStep === 'checkout1' && (
                      <>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900"
                              onClick={() => setCheckoutStep('cart')}
                            >
                              Voltar ao carrinho
                            </button>
                            <p className="text-[11px] text-slate-500">
                              Total: <span className="font-semibold text-slate-700">{total.toFixed(2)} €</span>
                            </p>
                          </div>

                          {checkoutError && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-2">
                              <p className="text-[11px] text-red-700">{checkoutError}</p>
                            </div>
                          )}

                          <div className="rounded-2xl border border-slate-200 bg-white p-3">
                            <p className="text-[11px] font-semibold text-slate-700 mb-2">
                              1) Dados do cliente
                            </p>

                            <div className="space-y-2">
                              <input
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-200"
                                placeholder="Nome completo *"
                                value={form.fullName}
                                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                              />
                              <input
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-200"
                                placeholder="Email *"
                                value={form.email}
                                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                              />
                              <input
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-200"
                                placeholder="Telemóvel *"
                                value={form.phone}
                                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                              />
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-white p-3">
                            <p className="text-[11px] font-semibold text-slate-700 mb-2">
                              2) Endereço de entrega
                            </p>

                            <div className="space-y-2">
                              <input
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-200"
                                placeholder="Morada (rua e número) *"
                                value={form.addressLine1}
                                onChange={(e) =>
                                  setForm((f) => ({ ...f, addressLine1: e.target.value }))
                                }
                              />
                              <input
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-200"
                                placeholder="Apto / complemento (opcional)"
                                value={form.addressLine2}
                                onChange={(e) =>
                                  setForm((f) => ({ ...f, addressLine2: e.target.value }))
                                }
                              />
                              <div className="flex items-center gap-2">
                                <input
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-200"
                                  placeholder="Cidade *"
                                  value={form.city}
                                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-200"
                                  placeholder="Código postal *"
                                  value={form.postalCode}
                                  onChange={(e) =>
                                    setForm((f) => ({ ...f, postalCode: e.target.value }))
                                  }
                                />
                              </div>
                              <input
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-200"
                                placeholder="País *"
                                value={form.country}
                                onChange={(e) =>
                                  setForm((f) => ({ ...f, country: e.target.value }))
                                }
                              />
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-white p-3">
                            <p className="text-[11px] font-semibold text-slate-700 mb-2">
                              3) Método de pagamento
                            </p>

                            <div className="space-y-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  className="accent-emerald-600"
                                  checked={paymentMethod === 'card'}
                                  onChange={() => setPaymentMethod('card')}
                                />
                                <span className="inline-flex items-center gap-2 text-[12px] text-slate-700">
                                  <CreditCardIcon className="w-4 h-4 text-slate-700" />
                                  Cartão (simulação)
                                </span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  className="accent-emerald-600"
                                  checked={paymentMethod === 'clinic'}
                                  onChange={() => setPaymentMethod('clinic')}
                                />
                                <span className="inline-flex items-center gap-2 text-[12px] text-slate-700">
                                  <WalletIcon className="w-4 h-4 text-slate-700" />
                                  Pagamento na clínica/farmácia
                                </span>
                              </label>
                            </div>

                            <p className="text-[11px] text-slate-500 mt-2">
                              Nesta fase é apenas demonstração. O checkout real será ligado mais tarde.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={submitCheckout}
                            className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 text-white px-3 py-2 text-xs font-semibold hover:bg-emerald-700 transition-colors"
                          >
                            Confirmar pedido
                          </button>
                        </div>
                      </>
                    )}

                    {checkoutStep === 'confirmation' && (
                      <>
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                          <p className="text-[12px] font-semibold text-emerald-800">
                            Pedido confirmado (simulação)
                          </p>
                          <p className="text-[11px] text-emerald-800 mt-1">
                            Obrigado {form.fullName.trim() ? form.fullName.trim() : 'por confiar em nós'}.
                            Receberá uma confirmação por email em breve.
                          </p>
                          <div className="mt-2 flex items-center justify-between text-xs">
                            <span className="text-emerald-800">Total</span>
                            <span className="font-semibold text-emerald-900">{total.toFixed(2)} €</span>
                          </div>
                        </div>

                        <div className="mt-3 space-y-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCheckoutStep('cart');
                              setIsCartOpen(false);
                              setCart([]);
                              setForm({
                                fullName: '',
                                email: '',
                                phone: '',
                                addressLine1: '',
                                addressLine2: '',
                                city: '',
                                postalCode: '',
                                country: 'Portugal',
                              });
                              setPaymentMethod('card');
                              setCheckoutConfirmed(false);
                            }}
                            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 text-white px-3 py-2 text-xs font-semibold hover:bg-slate-800 transition-colors"
                          >
                            Fechar e voltar
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Especialidades filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <ActivityIcon className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">Filtrar por especialidade:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SPECIALTIES.map((s) => {
            const isActive = activeSpecialty === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setActiveSpecialty(s)}
                className={[
                  'px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors',
                  isActive
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:text-emerald-700',
                ].join(' ')}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products */}
      <div className="grid gap-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="group relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <PillIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {p.category}
                  </span>
                </div>
                {p.rx && (
                  <span className="text-[10px] font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5">
                    Receita médica
                  </span>
                )}
              </div>

              <h2 className="text-sm font-semibold text-slate-900 mb-1">{p.name}</h2>
              <p className="text-xs text-slate-500 mb-3 line-clamp-2">{p.description}</p>

              <div className="flex items-end justify-between mt-auto">
                <div>
                  <span className="text-xs text-slate-500">Desde</span>
                  <div className="text-lg font-bold text-emerald-600 leading-none">
                    {p.price.toFixed(2)} €
                  </div>
                  <p className="text-[10px] text-slate-400">Especialidade: {p.specialty}</p>
                </div>

                <button
                  type="button"
                  onClick={() => addToCart(p)}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-3 py-1.5 text-xs font-semibold shadow-sm hover:bg-emerald-700 transition-colors"
                >
                  <PlusIcon className="w-3 h-3" />
                  Adicionar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientPharmacy;

