/**
 * Email Templates
 * Professional HTML email templates for the platform
 */

export interface EmailTemplateData {
  companyName?: string;
  customerName?: string;
  orderNumber?: string;
  orderAmount?: number;
  currency?: string;
  productName?: string;
  trackingNumber?: string;
  invoiceNumber?: string;
  invoiceLink?: string;
  discountCode?: string;
  discountAmount?: number;
  shippingAddress?: string;
  message?: string;
  [key: string]: any;
}

/**
 * Base email template wrapper
 */
const getEmailWrapper = (
  title: string,
  content: string,
  companyName: string = 'وافرلي - wafarle',
  footerText?: string
): string => {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      direction: rtl;
      text-align: right;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .email-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }
    .email-header h1 {
      font-size: 24px;
      margin-bottom: 10px;
    }
    .email-body {
      padding: 30px 20px;
    }
    .email-footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #e9ecef;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .order-info {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .order-info strong {
      color: #667eea;
    }
    .divider {
      height: 1px;
      background-color: #e9ecef;
      margin: 20px 0;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }
      .email-body {
        padding: 20px 15px !important;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>${companyName}</h1>
    </div>
    <div class="email-body">
      ${content}
    </div>
    <div class="email-footer">
      ${footerText || `© ${new Date().getFullYear()} ${companyName}. جميع الحقوق محفوظة.`}
      <br>
      <p style="margin-top: 10px;">
        هذا بريد إلكتروني تلقائي، يرجى عدم الرد عليه.<br>
        للاستفسارات: support@wafarle.com
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * New Order Template
 */
export const getNewOrderTemplate = (data: EmailTemplateData): string => {
  const {
    companyName = 'وافرلي - wafarle',
    customerName = 'عميلنا العزيز',
    orderNumber = '',
    orderAmount = 0,
    currency = 'SAR',
    productName = '',
  } = data;

  const content = `
    <h2 style="color: #667eea; margin-bottom: 20px;">شكراً لك على طلبك! 🎉</h2>
    <p>مرحباً <strong>${customerName}</strong>,</p>
    <p>نشكرك على ثقتك بنا. لقد استلمنا طلبك بنجاح وسنقوم بمعالجته في أقرب وقت ممكن.</p>
    
    <div class="order-info">
      <p><strong>رقم الطلب:</strong> ${orderNumber}</p>
      ${productName ? `<p><strong>المنتج:</strong> ${productName}</p>` : ''}
      <p><strong>المبلغ الإجمالي:</strong> ${orderAmount.toFixed(2)} ${currency}</p>
    </div>

    <p>ستتلقى رسالة تأكيد أخرى عند معالجة طلبك. يمكنك متابعة حالة طلبك من <a href="#" style="color: #667eea;">لوحة التحكم</a>.</p>
    
    <p>إذا كان لديك أي استفسارات، لا تتردد في التواصل معنا.</p>
    <p>مع أطيب التحيات،<br><strong>فريق ${companyName}</strong></p>
  `;

  return getEmailWrapper('تأكيد استلام الطلب', content, companyName);
};

/**
 * Order Confirmed Template
 */
export const getOrderConfirmedTemplate = (data: EmailTemplateData): string => {
  const {
    companyName = 'وافرلي - wafarle',
    customerName = 'عميلنا العزيز',
    orderNumber = '',
    orderAmount = 0,
    currency = 'SAR',
  } = data;

  const content = `
    <h2 style="color: #667eea; margin-bottom: 20px;">تم تأكيد طلبك! ✅</h2>
    <p>مرحباً <strong>${customerName}</strong>,</p>
    <p>نحن سعداء بإعلامك أنه تم تأكيد طلبك بنجاح.</p>
    
    <div class="order-info">
      <p><strong>رقم الطلب:</strong> ${orderNumber}</p>
      <p><strong>المبلغ:</strong> ${orderAmount.toFixed(2)} ${currency}</p>
    </div>

    <p>سيتم تجهيز طلبك قريباً. سنرسل لك تحديثات حول حالة الطلب عبر البريد الإلكتروني.</p>
    
    <a href="#" class="button">عرض تفاصيل الطلب</a>
    
    <p>شكراً لك على اختيار ${companyName}!</p>
  `;

  return getEmailWrapper('تم تأكيد الطلب', content, companyName);
};

/**
 * Order Shipped Template
 */
export const getOrderShippedTemplate = (data: EmailTemplateData): string => {
  const {
    companyName = 'وافرلي - wafarle',
    customerName = 'عميلنا العزيز',
    orderNumber = '',
    trackingNumber = '',
  } = data;

  const content = `
    <h2 style="color: #667eea; margin-bottom: 20px;">تم شحن طلبك! 📦</h2>
    <p>مرحباً <strong>${customerName}</strong>,</p>
    <p>نحن سعداء بإعلامك أن طلبك قد تم شحنه وهو في طريقه إليك.</p>
    
    <div class="order-info">
      <p><strong>رقم الطلب:</strong> ${orderNumber}</p>
      ${trackingNumber ? `<p><strong>رقم التتبع:</strong> ${trackingNumber}</p>` : ''}
    </div>

    <p>يمكنك تتبع شحنتك من <a href="#" style="color: #667eea;">هنا</a>.</p>
    
    <a href="#" class="button">تتبع الشحنة</a>
    
    <p>نتوقع وصول الطلب خلال 3-5 أيام عمل. سنرسل لك إشعاراً عند التوصيل.</p>
    
    <p>إذا كان لديك أي استفسارات، لا تتردد في التواصل معنا.</p>
    <p>مع أطيب التحيات،<br><strong>فريق ${companyName}</strong></p>
  `;

  return getEmailWrapper('تم شحن طلبك', content, companyName);
};

/**
 * Order Delivered Template
 */
export const getOrderDeliveredTemplate = (data: EmailTemplateData): string => {
  const {
    companyName = 'وافرلي - wafarle',
    customerName = 'عميلنا العزيز',
    orderNumber = '',
  } = data;

  const content = `
    <h2 style="color: #667eea; margin-bottom: 20px;">تم تسليم طلبك! 🎊</h2>
    <p>مرحباً <strong>${customerName}</strong>,</p>
    <p>نتمنى أن تكون راضياً عن طلبك!</p>
    
    <div class="order-info">
      <p><strong>رقم الطلب:</strong> ${orderNumber}</p>
    </div>

    <p>نتمنى أن يكون المنتج حسب توقعاتك. إذا كان لديك أي ملاحظات أو استفسارات، نحن هنا لمساعدتك.</p>
    
    <a href="#" class="button">تقييم المنتج</a>
    
    <div class="divider"></div>
    
    <p>نحن نقدر رأيك كثيراً! إذا أعجبك المنتج، يسعدنا أن تشاركنا تقييمك.</p>
    
    <p>شكراً لك على اختيار ${companyName}!</p>
  `;

  return getEmailWrapper('تم تسليم طلبك', content, companyName);
};

/**
 * Payment Received Template
 */
export const getPaymentReceivedTemplate = (data: EmailTemplateData): string => {
  const {
    companyName = 'وافرلي - wafarle',
    customerName = 'عميلنا العزيز',
    orderNumber = '',
    orderAmount = 0,
    currency = 'SAR',
  } = data;

  const content = `
    <h2 style="color: #667eea; margin-bottom: 20px;">تم استلام دفعتك! 💳</h2>
    <p>مرحباً <strong>${customerName}</strong>,</p>
    <p>تم استلام دفعتك بنجاح. شكراً لك!</p>
    
    <div class="order-info">
      <p><strong>رقم الطلب:</strong> ${orderNumber}</p>
      <p><strong>المبلغ المستلم:</strong> ${orderAmount.toFixed(2)} ${currency}</p>
    </div>

    <p>سيتم معالجة طلبك قريباً. ستتلقى تحديثات حول حالة الطلب.</p>
    
    <a href="#" class="button">عرض الطلب</a>
    
    <p>إذا كان لديك أي استفسارات حول الدفع، لا تتردد في التواصل معنا.</p>
    <p>مع أطيب التحيات،<br><strong>فريق ${companyName}</strong></p>
  `;

  return getEmailWrapper('تم استلام الدفع', content, companyName);
};

/**
 * Invoice Email Template
 */
export const getInvoiceTemplate = (data: EmailTemplateData): string => {
  const {
    companyName = 'وافرلي - wafarle',
    customerName = 'عميلنا العزيز',
    invoiceNumber = '',
    orderNumber = '',
    orderAmount = 0,
    currency = 'SAR',
    invoiceLink = '#',
  } = data;

  const content = `
    <h2 style="color: #667eea; margin-bottom: 20px;">فاتورتك جاهزة! 📄</h2>
    <p>مرحباً <strong>${customerName}</strong>,</p>
    <p>نرفق لك الفاتورة الخاصة بطلبك.</p>
    
    <div class="order-info">
      <p><strong>رقم الفاتورة:</strong> ${invoiceNumber}</p>
      <p><strong>رقم الطلب:</strong> ${orderNumber}</p>
      <p><strong>المبلغ الإجمالي:</strong> ${orderAmount.toFixed(2)} ${currency}</p>
    </div>

    <p>يمكنك تحميل الفاتورة من الرابط أدناه أو من لوحة التحكم.</p>
    
    <a href="${invoiceLink}" class="button">تحميل الفاتورة</a>
    
    <div class="divider"></div>
    
    <p><strong>ملاحظة:</strong> يرجى الاحتفاظ بهذه الفاتورة لسجلاتك.</p>
    
    <p>إذا كان لديك أي استفسارات، لا تتردد في التواصل معنا.</p>
    <p>مع أطيب التحيات،<br><strong>فريق ${companyName}</strong></p>
  `;

  return getEmailWrapper(`فاتورة رقم ${invoiceNumber}`, content, companyName);
};

/**
 * Generic email template renderer
 */
export const renderEmailTemplate = (
  template: string,
  data: EmailTemplateData
): string => {
  const templateMap: Record<string, (data: EmailTemplateData) => string> = {
    newOrder: getNewOrderTemplate,
    orderConfirmed: getOrderConfirmedTemplate,
    orderShipped: getOrderShippedTemplate,
    orderDelivered: getOrderDeliveredTemplate,
    paymentReceived: getPaymentReceivedTemplate,
    invoice: getInvoiceTemplate,
  };

  const templateFn = templateMap[template];
  if (!templateFn) {
    // Fallback to simple template
    return getEmailWrapper(
      data.subject || 'إشعار',
      `<p>${data.message || ''}</p>`,
      data.companyName
    );
  }

  return templateFn(data);
};






