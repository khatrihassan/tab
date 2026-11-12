import type { GuestBill, GuestItem } from '../lib/types';

/**
 * Mock bills, keyed by table token. All money is integer cents.
 * Table 7 matches Main.dc.html: subtotal $85.00, HST 13% $11.05, total $96.05.
 */

const RESTAURANT = 'Harbour & Elm';

const table7Items = (): GuestItem[] => [
  {
    id: 'item-burger',
    menuItemId: 'menu-burger',
    name: 'Burger',
    unitPrice: 1800,
    quantity: 1,
    paidAmount: 0,
  },
  {
    id: 'item-pasta',
    menuItemId: 'menu-pasta',
    name: 'Pasta',
    unitPrice: 2200,
    quantity: 1,
    paidAmount: 0,
  },
  {
    id: 'item-salad',
    menuItemId: 'menu-salad',
    name: 'Salad',
    unitPrice: 1400,
    quantity: 1,
    paidAmount: 0,
  },
  {
    id: 'item-nachos',
    menuItemId: 'menu-nachos',
    name: 'Nachos',
    unitPrice: 1600,
    quantity: 1,
    paidAmount: 0,
  },
  {
    id: 'item-drink',
    menuItemId: 'menu-drink',
    name: 'House drink',
    unitPrice: 500,
    quantity: 3,
    paidAmount: 0,
  },
];

const table7 = {
  tableId: 'table-7',
  serverId: 'staff-server-1',
  partySize: 3,
  openedAt: '2026-11-11T18:30:00.000Z',
  closedAt: null,
  restaurantName: RESTAURANT,
  tableNumber: 7,
  subtotal: 8500,
  tax: 1105,
  total: 9605,
};

/** Nothing paid yet. */
const demo: GuestBill = {
  ...table7,
  id: 'bill-demo',
  status: 'open',
  items: table7Items(),
  amountPaid: 0,
};

/** Jordan has paid for the Pasta: $22.00 + $2.86 HST. */
const demoPartial: GuestBill = {
  ...table7,
  id: 'bill-demo-partial',
  status: 'open',
  items: table7Items().map((item) =>
    item.id === 'item-pasta' ? { ...item, paidAmount: 2200, takenBy: 'Jordan' } : item,
  ),
  amountPaid: 2486,
};

/** Every item paid; scanning shows "This bill is fully paid". */
const demoPaid: GuestBill = {
  ...table7,
  id: 'bill-demo-paid',
  status: 'paid',
  items: table7Items().map((item) => ({ ...item, paidAmount: item.unitPrice * item.quantity })),
  amountPaid: 9605,
};

export const mockBills: Record<string, GuestBill> = {
  demo,
  'demo-partial': demoPartial,
  'demo-paid': demoPaid,
};
