// src/seed/initialAdmins.ts
import prisma from '../config/prisma.ts';
import bcrypt from 'bcrypt';
import { UserRole, ConfigCategory, AuditAction } from '../generated/prisma/enums.ts';

const saltRounds = 12;

interface AdminConfig {
  username: string;
  passwordEnv: string;
  fallbackPassword: string;
  full_name: string;
  role: UserRole;
}

const adminsToSeed: AdminConfig[] = [
  {
    username: 'cityadmin',
    passwordEnv: 'CITY_ADMIN_PASSWORD',
    fallbackPassword: 'CityAdmin123!',
    full_name: 'City Administrator',
    role: 'CITY_ADMIN',
  },
  {
    username: 'revenueadmin',
    passwordEnv: 'REVENUE_ADMIN_PASSWORD',
    fallbackPassword: 'RevenueAdmin123!',
    full_name: 'Revenue Administrator',
    role: 'REVENUE_ADMIN',
  },
];

// Configuration keys mapping (same as in your controller)
const CONFIG_KEYS: Record<ConfigCategory, string> = {
  LAND_TENURE: 'land_tenure_options',
  LAND_USE: 'land_use_options',
  ENCUMBRANCE_TYPE: 'encumbrance_type_options',
  TRANSFER_TYPE: 'transfer_type_options',
  REVENUE_TYPE: 'revenue_type_options',
  DOCUMENT_TYPE: 'document_type_options',
  PAYMENT_METHOD: 'payment_method_options',
  GENERAL: 'general_options',
  REVENUE_RATES: 'revenue_rates',
};

// Configuration value item interface
interface ConfigValueItem {
  value: string;
  description: string;
}

// Initial configuration values (with the format you specified)
interface InitialConfig {
  category: ConfigCategory;
  options: ConfigValueItem[];
  description: string;
  is_active: boolean;
}

const initialConfigs: InitialConfig[] = [
  {
    category: 'LAND_TENURE',
    options: [
      { value: 'LEASE', description: 'Leasehold tenure' },
      { value: 'OLD_POSSESSION', description: 'Old possession/Freehold tenure' }
    ],
    description: 'Land tenure types available in the system',
    is_active: true,
  },
  {
    category: 'LAND_USE',
    options: [
      { value: 'COMMERCIAL', description: 'Commercial use (shops, offices, etc.)' },
      { value: 'RESIDENTIAL', description: 'Residential use (houses, apartments)' },
      { value: 'HOTEL', description: 'Hotel and hospitality use' },
      { value: 'ORGANIZATION', description: 'Organizational/Institutional use' }
    ],
    description: 'Land use classifications',
    is_active: true,
  },
  {
    category: 'ENCUMBRANCE_TYPE',
    options: [
      { value: 'COURT', description: 'Court-ordered encumbrance' },
      { value: 'BANK', description: 'Bank/mortgage encumbrance' }
    ],
    description: 'Types of encumbrances that can be registered against a parcel',
    is_active: true,
  },
  {
    category: 'TRANSFER_TYPE',
    options: [
      { value: 'SALE', description: 'Property sale transaction' },
      { value: 'INHERITANCE', description: 'Property inheritance transfer' },
      { value: 'DONATION', description: 'Property donation/gift transfer' }
    ],
    description: 'Types of property transfers',
    is_active: true,
  },
  {
    category: 'REVENUE_TYPE',
    options: [
      { value: 'LEASE_FEE', description: 'Lease agreement fee' },
      { value: 'TRANSFER_FEE', description: 'Property transfer fee' },
      { value: 'ANNUAL_RENT', description: 'Annual land rent payment' },
      { value: 'PENALTY', description: 'Late payment penalty' },
      { value: 'SERVICE_CHARGE', description: 'Administrative service charge' }
    ],
    description: 'Types of revenue collected by the system',
    is_active: true,
  },
  {
    category: 'DOCUMENT_TYPE',
    options: [
      { value: 'TITLE_DEED', description: 'Property title deed document' },
      { value: 'LEASE_AGREEMENT', description: 'Lease agreement contract' },
      { value: 'IDENTIFICATION', description: 'Owner identification document' },
      { value: 'SURVEY_PLAN', description: 'Land survey plan/map' },
      { value: 'PAYMENT_RECEIPT', description: 'Payment receipt' },
      { value: 'TRANSFER_DOCUMENT', description: 'Property transfer document' },
      { value: 'COURT_ORDER', description: 'Court order document' },
      { value: 'BANK_GUARANTEE', description: 'Bank guarantee document' }
    ],
    description: 'Types of documents that can be uploaded',
    is_active: true,
  },
  {
    category: 'PAYMENT_METHOD',
    options: [
      { value: 'CASH', description: 'Cash payment' },
      { value: 'BANK_TRANSFER', description: 'Bank transfer' },
      { value: 'CHEQUE', description: 'Cheque payment' },
      { value: 'MOBILE_MONEY', description: 'Mobile money payment' },
      { value: 'CREDIT_CARD', description: 'Credit card payment' }
    ],
    description: 'Available payment methods',
    is_active: true,
  },
  {
    category: 'GENERAL',
    options: [
      { value: 'ENABLE_NOTIFICATIONS', description: 'Enable system notifications' },
      { value: 'ENABLE_AUDIT_TRAIL', description: 'Enable detailed audit trail' },
      { value: 'ENABLE_MAKER_CHECKER', description: 'Enable maker-checker workflow' },
      { value: 'REQUIRE_DOCUMENT_UPLOAD', description: 'Require document upload for transactions' }
    ],
    description: 'General system configuration options',
    is_active: true,
  },
  {
    category: 'REVENUE_RATES',
    options: [
      { 
        value: 'LEASE_FEE_RATE', 
        description: JSON.stringify({
          type: 'LEASE_FEE',
          rate: 0.05,
          description: '5% of property value',
          is_percentage: true
        })
      },
      { 
        value: 'TRANSFER_FEE_RATE', 
        description: JSON.stringify({
          type: 'TRANSFER_FEE',
          rate: 0.02,
          description: '2% of transfer value',
          is_percentage: true
        })
      },
      { 
        value: 'ANNUAL_RENT_AMOUNT', 
        description: JSON.stringify({
          type: 'ANNUAL_RENT',
          rate: 1000,
          description: 'Fixed annual rent per parcel',
          is_percentage: false,
          unit: 'ETB'
        })
      }
    ],
    description: 'Revenue rates and fees',
    is_active: true,
  },
];

export async function seedInitialAdmins() {
  console.log('👥 Running initial admin seed...');

  for (const admin of adminsToSeed) {
    try {
      const password = process.env[admin.passwordEnv] || admin.fallbackPassword;

      if (!process.env[admin.passwordEnv]) {
        console.warn(
          `⚠️ Warning: ${admin.passwordEnv} not set in .env. Using fallback password for ${admin.username} (development only!)`
        );
      }

      const existingUser = await prisma.users.findUnique({
        where: { username: admin.username },
      });

      if (existingUser) {
        console.log(`  ✓ User already exists: ${admin.username} (${admin.role})`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(password, saltRounds);

      await prisma.users.create({
        data: {
          username: admin.username,
          password_hash: hashedPassword,
          full_name: admin.full_name,
          role: admin.role,
          sub_city_id: null,
          is_active: true,
          is_deleted: false,
        },
      });

      console.log(`  ✓ Created initial admin: ${admin.username} (${admin.role})`);
    } catch (error) {
      console.error(`  ❌ Error creating admin ${admin.username}:`, error);
    }
  }

  console.log('✅ Admin seed completed.');
}

export async function seedOnlyConfigs() {
  console.log('⚙️ Running configuration seed...');
  
  // Get system user for audit logs (or create a system user if none exists)
  let systemUser = await prisma.users.findFirst({
    where: { username: 'system' }
  });

  if (!systemUser) {
    systemUser = await prisma.users.create({
      data: {
        username: 'system',
        password_hash: await bcrypt.hash('system-' + Date.now(), saltRounds),
        full_name: 'System User',
        role: 'CITY_ADMIN',
        sub_city_id: null,
        is_active: true,
        is_deleted: false,
      }
    });
    console.log('  ✓ Created system user for audit logs');
  }

  for (const config of initialConfigs) {
    try {
      const key = CONFIG_KEYS[config.category];
      
      if (!key) {
        console.error(`  ❌ Invalid category: ${config.category}`);
        continue;
      }

      // Check if config already exists
      const existingConfig = await prisma.configurations.findUnique({
        where: { key },
      });

      if (existingConfig) {
        console.log(`  ✓ Configuration already exists: ${key} (${config.category})`);
        continue;
      }

      // Create new configuration with the value in the format: [{ value: "", description: "" }]
      const created = await prisma.configurations.create({
        data: {
          key,
          value: config.options, // This will be stored as JSON array of {value, description}
          category: config.category,
          description: config.description,
          is_active: config.is_active,
        },
      });

      // Create audit log for config creation
      await prisma.audit_logs.create({
        data: {
          user_id: systemUser.user_id,
          action_type: AuditAction.CONFIG_CHANGE,
          entity_type: 'configurations',
          entity_id: created.config_id,
          changes: {
            action: 'create_config',
            category: config.category,
            key,
            previous_value: null,
            new_value: config.options,
            previous_description: null,
            new_description: config.description,
            previous_is_active: null,
            new_is_active: config.is_active,
            actor_id: systemUser.user_id,
            actor_role: systemUser.role,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: '127.0.0.1', // System seed IP
        },
      });

      console.log(`  ✓ Created configuration: ${key} (${config.category})`);
      console.log(`     Values: ${config.options.map(opt => opt.value).join(', ')}`);
    } catch (error) {
      console.error(`  ❌ Error creating configuration ${config.category}:`, error);
    }
  }

  console.log('✅ Configuration seed completed.');
}

// Function to seed configs with a specific user (useful for testing)
export async function seedConfigsWithUser(userId: string) {
  console.log('⚙️ Running configuration seed with specific user...');
  
  const user = await prisma.users.findUnique({
    where: { user_id: userId }
  });

  if (!user) {
    throw new Error('User not found for audit logging');
  }

  for (const config of initialConfigs) {
    try {
      const key = CONFIG_KEYS[config.category];
      
      if (!key) {
        console.error(`  ❌ Invalid category: ${config.category}`);
        continue;
      }

      // Check if config already exists
      const existingConfig = await prisma.configurations.findUnique({
        where: { key },
      });

      if (existingConfig) {
        console.log(`  ✓ Configuration already exists: ${key} (${config.category})`);
        continue;
      }

      // Create new configuration
      const created = await prisma.configurations.create({
        data: {
          key,
          value: config.options,
          category: config.category,
          description: config.description,
          is_active: config.is_active,
        },
      });

      // Create audit log
      await prisma.audit_logs.create({
        data: {
          user_id: user.user_id,
          action_type: AuditAction.CONFIG_CHANGE,
          entity_type: 'configurations',
          entity_id: created.config_id,
          changes: {
            action: 'create_config',
            category: config.category,
            key,
            previous_value: null,
            new_value: config.options,
            previous_description: null,
            new_description: config.description,
            previous_is_active: null,
            new_is_active: config.is_active,
            actor_id: user.user_id,
            actor_role: user.role,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: '127.0.0.1',
        },
      });

      console.log(`  ✓ Created configuration: ${key} (${config.category})`);
    } catch (error) {
      console.error(`  ❌ Error creating configuration ${config.category}:`, error);
    }
  }

  console.log('✅ Configuration seed completed.');
}

// Optional: Reset configurations to default (with audit logs)
export async function resetConfigsToDefault() {
  console.log('🔄 Resetting configurations to default...');
  
  // Get system user
  let systemUser = await prisma.users.findFirst({
    where: { username: 'system' }
  });

  if (!systemUser) {
    systemUser = await prisma.users.create({
      data: {
        username: 'system',
        password_hash: await bcrypt.hash('system-' + Date.now(), saltRounds),
        full_name: 'System User',
        role: 'CITY_ADMIN',
        sub_city_id: null,
        is_active: true,
        is_deleted: false,
      }
    });
  }
  
  for (const config of initialConfigs) {
    try {
      const key = CONFIG_KEYS[config.category];
      
      if (!key) {
        console.error(`  ❌ Invalid category: ${config.category}`);
        continue;
      }

      // Get previous value for audit log
      const existingConfig = await prisma.configurations.findUnique({
        where: { key },
      });

      // Upsert configuration
      const updated = await prisma.configurations.upsert({
        where: { key },
        update: {
          value: JSON.stringify(config.options),
          description: config.description,
          is_active: config.is_active,
          updated_at: new Date(),
        },
        create: {
          key,
          value: JSON.stringify(config.options),
          category: config.category,
          description: config.description,
          is_active: config.is_active,
        },
      });

      // Create audit log
      await prisma.audit_logs.create({
        data: {
          user_id: systemUser.user_id,
          action_type: AuditAction.CONFIG_CHANGE,
          entity_type: 'configurations',
          entity_id: updated.config_id,
          changes: {
            action: 'reset_config',
            category: config.category,
            key,
            previous_value: existingConfig?.value || null,
            new_value: config.options,
            previous_description: existingConfig?.description || null,
            new_description: config.description,
            previous_is_active: existingConfig?.is_active || null,
            new_is_active: config.is_active,
            actor_id: systemUser.user_id,
            actor_role: systemUser.role,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          ip_address: '127.0.0.1',
        },
      });

      console.log(`  ✓ Reset configuration: ${key}`);
    } catch (error) {
      console.error(`  ❌ Error resetting configuration ${config.category}:`, error);
    }
  }
  
  console.log('✅ Configuration reset completed.');
}