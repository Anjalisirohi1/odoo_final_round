const model = require('../models/invoiceModel');
const { pool } = require('../config/db');

async function getInvoiceDetailsWithItems(id) {
  const invoice = await model.getInvoiceById(id);
  if (!invoice) return null;

  const totalAmount = Number(invoice.total_amount || invoice.amount || 248000);
  const isPaid = invoice.status === 'PAID';
  const amountPaid = isPaid ? totalAmount : Number(invoice.amount_paid || 0);
  const outstandingBalance = isPaid ? 0 : Math.max(0, totalAmount - amountPaid);

  // Mock itemized details or fetch from DB if items table exists
  const items = [
    {
      id: 'item-1',
      name: 'Enterprise Software License',
      description: 'Annual platform subscription (100 seats)',
      qty: 1,
      unit_price: 180000.00,
      tax_rate: '18%',
      tax_amount: 32400.00,
      amount: 212400.00
    },
    {
      id: 'item-2',
      name: 'Implementation Services',
      description: 'Configuration and onboarding sprint',
      qty: 1,
      unit_price: 30000.00,
      tax_rate: '18%',
      tax_amount: 5400.00,
      amount: 35400.00
    },
    {
      id: 'item-3',
      name: 'Priority Support',
      description: '24/7 dedicated support package (Annual)',
      qty: 1,
      unit_price: 15000.00,
      tax_rate: '18%',
      tax_amount: 2700.00,
      amount: 17700.00
    }
  ];

  const activity = [
    {
      id: 'act-1',
      title: 'Automated payment reminder queued',
      desc: 'Overdue Dunning Step 1 dispatched to AP',
      time: '17 Oct 2026, 10:30 AM',
      color: 'bg-rose-500'
    },
    {
      id: 'act-2',
      title: 'Payment due date passed',
      desc: 'Status shifted automatically to Overdue',
      time: '12 Oct 2026, 11:58 PM',
      color: 'bg-amber-500'
    },
    {
      id: 'act-3',
      title: 'Invoice viewed by customer',
      desc: 'Opened by finance@acmecorp.com',
      time: '20 Sep 2026, 04:15 PM',
      color: 'bg-blue-500'
    },
    {
      id: 'act-4',
      title: 'Invoice sent to customer',
      desc: 'Dispatched via automated email relay',
      time: '12 Sep 2026, 02:00 PM',
      color: 'bg-blue-500'
    },
    {
      id: 'act-5',
      title: 'Invoice created',
      desc: 'Created by Alex Vance from approved Quotation Q-1042',
      time: '12 Sep 2026, 11:45 AM',
      color: 'bg-slate-400'
    }
  ];

  const quotationNum = invoice.quotation_number || 'QT-2026-1042';
  const subNum = invoice.subscription_number || 'SUB-1042';
  const custName = invoice.customer_name || 'Acme Corporation';

  const connectedRecords = [
    { type: 'QT', number: quotationNum, desc: 'Approved • Quotation Record', link: `/quotations` },
    { type: 'SB', number: subNum, desc: 'Active • Enterprise Subscription', link: '/subscriptions' },
    { type: 'AC', number: custName, desc: 'Enterprise • Customer Billing Account', link: '/billing-details' }
  ];

  return {
    ...invoice,
    total_amount: totalAmount,
    amount_paid: amountPaid,
    outstanding_balance: outstandingBalance,
    items,
    activity,
    connectedRecords,
    bankDetails: {
      bankName: 'HDFC Bank Ltd',
      accountNumber: '50200084729104',
      ifscCode: 'HDFC0000240',
      accountType: 'Current Account'
    }
  };
}

async function sendReminder(id) {
  return {
    invoiceId: id,
    status: 'REMINDER_SENT',
    sentAt: new Date()
  };
}

module.exports = {
  getInvoiceDetailsWithItems,
  sendReminder
};
