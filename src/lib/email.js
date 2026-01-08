import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Initialize EmailJS
emailjs.init(PUBLIC_KEY);

export async function sendOrderNotification(order, items) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn('EmailJS not configured. Skipping email notification.');
    return;
  }

  const itemsList = items.map(item => 
    `- ${item.name} (${item.size}) x${item.quantity} - €${item.price * item.quantity}`
  ).join('\n');

  const templateParams = {
    order_id: order.id,
    customer_name: order.customer_name,
    customer_phone: order.phone,
    customer_address: `${order.address}, ${order.city}`,
    customer_note: order.note || 'Nema napomene',
    items_list: itemsList,
    total: `€${order.total}`,
    order_date: new Date().toLocaleString('sr-Latn-ME'),
  };

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
    console.log('Order notification email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw - email failure shouldn't break the order
  }
}

export async function sendStatusUpdateNotification(order, newStatus) {
  // You can implement this to notify customers of status changes
  // For now, just log
  console.log(`Order ${order.id} status updated to ${newStatus}`);
}
