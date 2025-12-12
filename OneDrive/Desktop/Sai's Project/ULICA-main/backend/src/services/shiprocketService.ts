import axios from 'axios';
import { logger } from './loggerService';

export interface ShiprocketConfig {
  email: string;
  password: string;
  baseUrl: string;
}

// Shiprocket configuration
const shiprocketConfig: ShiprocketConfig = {
  email: process.env['SHIPROCKET_EMAIL']!,
  password: process.env['SHIPROCKET_PASSWORD']!,
  baseUrl: process.env['SHIPROCKET_BASE_URL'] || 'https://apiv2.shiprocket.in/v1/external'
};

let authToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Authenticate with Shiprocket
 */
async function authenticateShiprocket(): Promise<string> {
  // Check if token is still valid
  if (authToken && Date.now() < tokenExpiry) {
    return authToken;
  }

  try {
    const response = await axios.post(`${shiprocketConfig.baseUrl}/auth/login`, {
      email: shiprocketConfig.email,
      password: shiprocketConfig.password
    });

    if (response.data.status === 200) {
      authToken = response.data.token as string;
      tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      return authToken;
    } else {
      throw new Error('Shiprocket authentication failed');
    }
  } catch (error) {
    await logger.error('Shiprocket authentication error', { error: error instanceof Error ? error.message : String(error) });
    throw new Error('Failed to authenticate with Shiprocket');
  }
}

/**
 * Check serviceability for a pincode
 */
export async function checkServiceability(pincode: string, weight: number) {
  try {
    const token = await authenticateShiprocket();
    
    const response = await axios.post(`${shiprocketConfig.baseUrl}/courier/serviceability`, {
      pickup_pincode: process.env['SHIPROCKET_PICKUP_PINCODE'] || '110001',
      delivery_pincode: pincode,
      weight: weight,
      cod: 0 // Cash on delivery not available
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.status === 200 && response.data.data.available_courier_companies) {
      const couriers = response.data.data.available_courier_companies;
      
      return couriers.map((courier: any) => ({
        courierName: courier.courier_name,
        courierCompanyId: courier.courier_company_id,
        rate: courier.rate,
        estimatedDeliveryDays: courier.estimated_delivery_days,
        codAvailable: courier.cod === 1
      }));
    } else {
      // Return default rates if serviceability check fails
      return getDefaultShippingRates();
    }
  } catch (error) {
    await logger.error('Shiprocket serviceability check failed', { error: error instanceof Error ? error.message : String(error), pincode, weight });
    // Return default rates as fallback
    return getDefaultShippingRates();
  }
}

/**
 * Create shipment
 */
export async function createShipment(orderData: any) {
  try {
    const token = await authenticateShiprocket();
    
    const shipmentData = {
      order_id: orderData.orderId,
      order_date: new Date().toISOString(),
      pickup_location: process.env['SHIPROCKET_PICKUP_LOCATION'] || 'Primary',
      billing_customer_name: orderData.billingAddress.firstName + ' ' + orderData.billingAddress.lastName,
      billing_last_name: orderData.billingAddress.lastName,
      billing_address: orderData.shippingAddress.line1,
      billing_address_2: orderData.shippingAddress.line2 || '',
      billing_city: orderData.shippingAddress.city,
      billing_pincode: orderData.shippingAddress.pincode,
      billing_state: orderData.shippingAddress.state,
      billing_country: orderData.shippingAddress.country || 'India',
      billing_email: orderData.customerEmail,
      billing_phone: orderData.customerPhone,
      shipping_is_billing: true,
      order_items: orderData.items.map((item: any) => ({
        name: item.product.title,
        sku: item.variant.sku,
        units: item.quantity,
        selling_price: item.unitPrice
      })),
      payment_method: 'Prepaid',
      sub_total: orderData.subtotal,
      length: 10,
      breadth: 10,
      height: 10,
      weight: orderData.totalWeight || 0.5
    };

    const response = await axios.post(`${shiprocketConfig.baseUrl}/orders/create/adhoc`, shipmentData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.status === 201) {
      return {
        shipmentId: response.data.order_id,
        awbCode: response.data.awb_code,
        courierName: response.data.courier_name,
        trackingUrl: response.data.tracking_url
      };
    } else {
      throw new Error('Shipment creation failed');
    }
  } catch (error) {
    await logger.error('Shiprocket shipment creation failed', { error: error instanceof Error ? error.message : String(error), orderId: orderData.orderId });
    throw new Error('Failed to create shipment');
  }
}

/**
 * Generate shipping label
 */
export async function generateShippingLabel(shipmentId: string) {
  try {
    const token = await authenticateShiprocket();
    
    const response = await axios.get(`${shiprocketConfig.baseUrl}/orders/print/invoice/${shipmentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      responseType: 'arraybuffer'
    });

    return {
      labelData: Buffer.from(response.data).toString('base64'),
      contentType: 'application/pdf'
    };
  } catch (error) {
    await logger.error('Shiprocket label generation failed', { error: error instanceof Error ? error.message : String(error), shipmentId });
    throw new Error('Failed to generate shipping label');
  }
}

/**
 * Track shipment with real-time updates
 */
export async function trackShipment(awbCode: string) {
  try {
    const token = await authenticateShiprocket();
    
    const response = await axios.get(`${shiprocketConfig.baseUrl}/courier/track/awb/${awbCode}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.status === 200) {
      const trackingData = response.data.data.tracking_data || [];
      
      return {
        awbCode: response.data.data.awb_code,
        courierName: response.data.data.courier_name,
        status: response.data.data.status,
        currentStatus: getCurrentStatus(trackingData),
        estimatedDelivery: response.data.data.estimated_delivery_date,
        trackingData: trackingData.map((event: any) => ({
          status: event.status,
          location: event.location,
          timestamp: event.status_date,
          description: event.status_description || event.status
        }))
      };
    } else {
      throw new Error('Tracking information not available');
    }
  } catch (error) {
    await logger.error('Shiprocket tracking failed', { error: error instanceof Error ? error.message : String(error), awbCode });
    throw new Error('Failed to track shipment');
  }
}

/**
 * Get real-time tracking status
 */
export async function getRealTimeTracking(awbCode: string) {
  try {
    const token = await authenticateShiprocket();
    
    const response = await axios.get(`${shiprocketConfig.baseUrl}/courier/track/awb/${awbCode}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.status === 200) {
      return {
        success: true,
        data: {
          awbCode: response.data.data.awb_code,
          courierName: response.data.data.courier_name,
          status: response.data.data.status,
          currentStatus: getCurrentStatus(response.data.data.tracking_data || []),
          estimatedDelivery: response.data.data.estimated_delivery_date,
          trackingEvents: (response.data.data.tracking_data || []).map((event: any) => ({
            status: event.status,
            location: event.location,
            timestamp: event.status_date,
            description: event.status_description || event.status
          }))
        }
      };
    } else {
      return {
        success: false,
        error: 'Tracking information not available'
      };
    }
  } catch (error) {
    await logger.error('Real-time tracking failed', { error: error instanceof Error ? error.message : String(error), awbCode });
    return {
      success: false,
      error: 'Failed to get tracking information'
    };
  }
}

/**
 * Generate enhanced shipping label with QR code
 */
export async function generateEnhancedShippingLabel(shipmentId: string) {
  try {
    const token = await authenticateShiprocket();
    
    // Get shipment details first
    const shipmentResponse = await axios.get(`${shiprocketConfig.baseUrl}/orders/show/${shipmentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (shipmentResponse.data.status !== 200) {
      throw new Error('Shipment not found');
    }

    const shipment = shipmentResponse.data.data;
    
    // Generate label
    const labelResponse = await axios.get(`${shiprocketConfig.baseUrl}/orders/print/invoice/${shipmentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      responseType: 'arraybuffer'
    });

    return {
      success: true,
      data: {
        labelData: Buffer.from(labelResponse.data).toString('base64'),
        contentType: 'application/pdf',
        awbCode: shipment.awb_code,
        courierName: shipment.courier_name,
        trackingUrl: shipment.tracking_url,
        qrCode: generateQRCode(shipment.awb_code)
      }
    };
  } catch (error) {
    await logger.error('Enhanced label generation failed', { error: error instanceof Error ? error.message : String(error), shipmentId });
    return {
      success: false,
      error: 'Failed to generate shipping label'
    };
  }
}

/**
 * Generate QR code for tracking
 */
function generateQRCode(awbCode: string): string {
  // In a real implementation, you would use a QR code library
  // For now, return a placeholder
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${awbCode}`;
}

/**
 * Get current status from tracking data
 */
function getCurrentStatus(trackingData: any[]): string {
  if (!trackingData || trackingData.length === 0) {
    return 'PENDING';
  }
  
  const latestEvent = trackingData[trackingData.length - 1];
  return latestEvent.status || 'PENDING';
}

/**
 * Get default shipping rates (fallback)
 */
function getDefaultShippingRates() {
  return [
    {
      courierName: 'Standard Shipping',
      courierCompanyId: 'standard',
      rate: 5000, // ₹50 in paise
      estimatedDeliveryDays: '3-5 days',
      codAvailable: false
    },
    {
      courierName: 'Express Shipping',
      courierCompanyId: 'express',
      rate: 10000, // ₹100 in paise
      estimatedDeliveryDays: '1-2 days',
      codAvailable: false
    }
  ];
}