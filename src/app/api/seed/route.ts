import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST() {
  try {
    // Clean up existing data (reverse order of dependencies)
    await db.payment.deleteMany();
    await db.walletTransaction.deleteMany();
    await db.installment.deleteMany();
    await db.invoice.deleteMany();
    await db.calendarEvent.deleteMany();
    await db.timeEntry.deleteMany();
    await db.lead.deleteMany();
    await db.message.deleteMany();
    await db.comment.deleteMany();
    await db.post.deleteMany();
    await db.enrollment.deleteMany();
    await db.examResult.deleteMany();
    await db.exam.deleteMany();
    await db.lesson.deleteMany();
    await db.course.deleteMany();
    await db.notification.deleteMany();
    await db.document.deleteMany();
    await db.activity.deleteMany();
    await db.task.deleteMany();
    await db.caseDeadline.deleteMany();
    await db.hearing.deleteMany();
    await db.caseNote.deleteMany();
    await db.caseComment.deleteMany();
    await db.caseTimeline.deleteMany();
    await db.caseDocument.deleteMany();
    await db.appointment.deleteMany();
    await db.legalCase.deleteMany();
    await db.session.deleteMany();
    await db.device.deleteMany();
    await db.auditLog.deleteMany();
    await db.internProfile.deleteMany();
    await db.accountantProfile.deleteMany();
    await db.clientProfile.deleteMany();
    await db.lawyerProfile.deleteMany();
    await db.setting.deleteMany();
    await db.user.deleteMany();

    const hashedPassword = await hashPassword('123456');

    // ============ CREATE USERS ============

    // 1. Super Admin
    const admin = await db.user.create({
      data: {
        email: 'admin@legalhub.ir',
        password: hashedPassword,
        firstName: 'محمد',
        lastName: 'رضایی',
        phone: '09121234567',
        nationalCode: '0012345678',
        role: 'SUPER_ADMIN',
        isActive: true,
        isVerified: true,
        avatar: null,
      },
    });

    // 2. Complex Manager
    const manager = await db.user.create({
      data: {
        email: 'manager@legalhub.ir',
        password: hashedPassword,
        firstName: 'علی',
        lastName: 'محمدی',
        phone: '09129876543',
        nationalCode: '0023456789',
        role: 'COMPLEX_MANAGER',
        isActive: true,
        isVerified: true,
        avatar: null,
      },
    });

    // 3. Lawyers
    const lawyer1 = await db.user.create({
      data: {
        email: 'lawyer1@legalhub.ir',
        password: hashedPassword,
        firstName: 'حسین',
        lastName: 'کریمی',
        phone: '09131112233',
        nationalCode: '0034567890',
        role: 'LAWYER',
        isActive: true,
        isVerified: true,
        avatar: null,
      },
    });

    const lawyer2 = await db.user.create({
      data: {
        email: 'lawyer2@legalhub.ir',
        password: hashedPassword,
        firstName: 'فاطمه',
        lastName: 'احمدی',
        phone: '09142223344',
        nationalCode: '0045678901',
        role: 'LAWYER',
        isActive: true,
        isVerified: true,
        avatar: null,
      },
    });

    const lawyer3 = await db.user.create({
      data: {
        email: 'lawyer3@legalhub.ir',
        password: hashedPassword,
        firstName: 'رضا',
        lastName: 'نوری',
        phone: '09153334455',
        nationalCode: '0056789012',
        role: 'LAWYER',
        isActive: true,
        isVerified: true,
        avatar: null,
      },
    });

    // Lawyer Profiles
    await db.lawyerProfile.create({
      data: {
        userId: lawyer1.id,
        licenseNumber: 'LAW-12345',
        specialization: 'civil',
        bio: 'وکیل پایه یک دادگستری با تخصص در دعاوی حقوقی و مدنی. بیش از ۱۵ سال سابقه وکالت',
        experience: 15,
        rating: 4.8,
        hourlyRate: 2500000,
        isAvailable: true,
        barAdmission: 'کانون وکلای تهران',
        education: 'دکتری حقوق خصوصی - دانشگاه تهران',
        languages: '["فارسی", "انگلیسی"]',
      },
    });

    await db.lawyerProfile.create({
      data: {
        userId: lawyer2.id,
        licenseNumber: 'LAW-12346',
        specialization: 'criminal',
        bio: 'متخصص دعاوی کیفری و جنایی. وکیل ارشد در پرونده‌های مهم جنایی',
        experience: 12,
        rating: 4.6,
        hourlyRate: 3000000,
        isAvailable: true,
        barAdmission: 'کانون وکلای تهران',
        education: 'کارشناسی ارشد حقوق کیفری - دانشگاه شریف',
        languages: '["فارسی", "عربی"]',
      },
    });

    await db.lawyerProfile.create({
      data: {
        userId: lawyer3.id,
        licenseNumber: 'LAW-12347',
        specialization: 'corporate',
        bio: 'مشاور حقوقی شرکت‌ها و سازمان‌ها. تخصص در حقوق تجارت بین‌الملل',
        experience: 10,
        rating: 4.5,
        hourlyRate: 3500000,
        isAvailable: true,
        barAdmission: 'کانون وکلای تهران',
        education: 'دکتری حقوق تجارت بین‌الملل - دانشگاه علامه طباطبایی',
        languages: '["فارسی", "انگلیسی", "فرانسوی"]',
      },
    });

    // 4. Interns
    const intern1 = await db.user.create({
      data: {
        email: 'intern1@legalhub.ir',
        password: hashedPassword,
        firstName: 'سارا',
        lastName: 'موسوی',
        phone: '09164445566',
        nationalCode: '0067890123',
        role: 'INTERN',
        isActive: true,
        isVerified: false,
        avatar: null,
      },
    });

    const intern2 = await db.user.create({
      data: {
        email: 'intern2@legalhub.ir',
        password: hashedPassword,
        firstName: 'امیر',
        lastName: 'حسینی',
        phone: '09175556677',
        nationalCode: '0078901234',
        role: 'INTERN',
        isActive: true,
        isVerified: false,
        avatar: null,
      },
    });

    await db.internProfile.create({
      data: {
        userId: intern1.id,
        university: 'دانشگاه تهران',
        field: 'حقوق خصوصی',
        supervisorId: lawyer1.id,
        startDate: new Date('1402-07-01'),
        endDate: new Date('1403-06-31'),
      },
    });

    await db.internProfile.create({
      data: {
        userId: intern2.id,
        university: 'دانشگاه شریف',
        field: 'حقوق کیفری',
        supervisorId: lawyer2.id,
        startDate: new Date('1402-09-01'),
        endDate: new Date('1403-08-31'),
      },
    });

    // 5. Clients
    const client1 = await db.user.create({
      data: {
        email: 'client1@legalhub.ir',
        password: hashedPassword,
        firstName: 'مریم',
        lastName: 'جعفری',
        phone: '09186667788',
        nationalCode: '0089012345',
        role: 'CLIENT',
        isActive: true,
        isVerified: true,
        avatar: null,
      },
    });

    const client2 = await db.user.create({
      data: {
        email: 'client2@legalhub.ir',
        password: hashedPassword,
        firstName: 'احمد',
        lastName: 'صادقی',
        phone: '09197778899',
        nationalCode: '0090123456',
        role: 'CLIENT',
        isActive: true,
        isVerified: true,
        avatar: null,
      },
    });

    const client3 = await db.user.create({
      data: {
        email: 'client3@legalhub.ir',
        password: hashedPassword,
        firstName: 'زهرا',
        lastName: 'قاسمی',
        phone: '09208889900',
        nationalCode: '0101234567',
        role: 'CLIENT',
        isActive: true,
        isVerified: true,
        avatar: null,
      },
    });

    const client4 = await db.user.create({
      data: {
        email: 'client4@legalhub.ir',
        password: hashedPassword,
        firstName: 'مهدی',
        lastName: 'عباسی',
        phone: '09219990011',
        nationalCode: '0112345678',
        role: 'CLIENT',
        isActive: true,
        isVerified: false,
        avatar: null,
      },
    });

    const client5 = await db.user.create({
      data: {
        email: 'client5@legalhub.ir',
        password: hashedPassword,
        firstName: 'نرگس',
        lastName: 'طاهری',
        phone: '09221111222',
        nationalCode: '0123456789',
        role: 'CLIENT',
        isActive: true,
        isVerified: true,
        avatar: null,
      },
    });

    // Client Profiles
    await Promise.all([
      db.clientProfile.create({
        data: {
          userId: client1.id,
          company: 'شرکت فناوری اطلاعات پارس',
          address: 'تهران، خیابان ولیعصر، پلاک ۱۲۳',
          city: 'تهران',
          province: 'تهران',
          postalCode: '1234567890',
          occupation: 'مدیرعامل',
        },
      }),
      db.clientProfile.create({
        data: {
          userId: client2.id,
          company: 'بازرگانی امین',
          address: 'اصفهان، خیابان چهارباغ، پلاک ۴۵۶',
          city: 'اصفهان',
          province: 'اصفهان',
          postalCode: '2345678901',
          occupation: 'تاجر',
        },
      }),
      db.clientProfile.create({
        data: {
          userId: client3.id,
          address: 'شیراز، خیابان زند، پلاک ۷۸۹',
          city: 'شیراز',
          province: 'فارس',
          postalCode: '3456789012',
          occupation: 'مهندس',
        },
      }),
      db.clientProfile.create({
        data: {
          userId: client4.id,
          company: 'گروه صنعتی نوین',
          address: 'تهران، خیابان آزادی، پلاک ۳۲۱',
          city: 'تهران',
          province: 'تهران',
          occupation: 'مدیر مالی',
        },
      }),
      db.clientProfile.create({
        data: {
          userId: client5.id,
          address: 'مشهد، خیابان امام رضا، پلاک ۶۵۴',
          city: 'مشهد',
          province: 'خراسان رضوی',
          occupation: 'پزشک',
        },
      }),
    ]);

    // 6. Accountant
    const accountant = await db.user.create({
      data: {
        email: 'accountant@legalhub.ir',
        password: hashedPassword,
        firstName: 'لیلا',
        lastName: 'کاظمی',
        phone: '09223334455',
        nationalCode: '0134567890',
        role: 'ACCOUNTANT',
        isActive: true,
        isVerified: true,
        avatar: null,
      },
    });

    await db.accountantProfile.create({
      data: {
        userId: accountant.id,
        license: 'ACC-98765',
        department: 'مالی و حسابداری',
      },
    });

    // 7. Support Staff
    const support = await db.user.create({
      data: {
        email: 'support@legalhub.ir',
        password: hashedPassword,
        firstName: 'امیرحسین',
        lastName: 'بهرامی',
        phone: '09234445566',
        nationalCode: '0145678901',
        role: 'SUPPORT',
        isActive: true,
        isVerified: true,
        avatar: null,
      },
    });

    // ============ CREATE CASES ============

    const case1 = await db.legalCase.create({
      data: {
        title: 'دعوی حقوقی ملکی - زمین تجاری',
        caseNumber: 'CASE-0001-2024',
        type: 'civil',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        description: 'دعوی حقوقی مربوط به نقل و انتقال زمین تجاری در منطقه ۲۲ تهران. خواهان ادعای مالکیت دارد و خوانده مدعی جعلی بودن سند دارد.',
        summary: 'مناقشه بر سر مالکیت زمین تجاری',
        court: 'دادگاه حقوقی تهران',
        courtBranch: 'شعبه ۱۲',
        judgeName: 'قاضی موسوی',
        filingDate: new Date('2024-01-15'),
        nextHearing: new Date('2024-08-10'),
        clientId: client1.id,
        lawyerId: lawyer1.id,
        internId: intern1.id,
        tags: '["ملکی", "زمین", "تجاری"]',
      },
    });

    const case2 = await db.legalCase.create({
      data: {
        title: 'پرونده کیفری - کلاهبرداری',
        caseNumber: 'CASE-0002-2024',
        type: 'criminal',
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        description: 'پرونده کیفری مربوط به کلاهبرداری مالی به مبلغ ۵ میلیارد تومان. متهم رد شده و در بازداشت موقت به سر می‌برد.',
        summary: 'کلاهبرداری ۵ میلیارد تومانی',
        court: 'دادگاه کیفری تهران',
        courtBranch: 'شعبه ۵',
        judgeName: 'قاضی رحیمی',
        filingDate: new Date('2024-02-20'),
        nextHearing: new Date('2024-07-25'),
        clientId: client2.id,
        lawyerId: lawyer2.id,
        internId: intern2.id,
        tags: '["کیفری", "کلاهبرداری", "مالی"]',
      },
    });

    const case3 = await db.legalCase.create({
      data: {
        title: 'قرارداد تجاری بین‌المللی',
        caseNumber: 'CASE-0003-2024',
        type: 'corporate',
        status: 'OPEN',
        priority: 'HIGH',
        description: 'بازبینی و تنظیم قرارداد تجاری بین شرکت ایرانی و شرکای خارجی. شامل بندهای حل اختلاف و آرbitration بین‌المللی.',
        summary: 'تنظیم قرارداد تجاری بین‌المللی',
        court: 'دیوان داوری بین‌المللی',
        clientId: client3.id,
        lawyerId: lawyer3.id,
        tags: '["تجاری", "بین‌المللی", "قرارداد"]',
      },
    });

    const case4 = await db.legalCase.create({
      data: {
        title: 'دعوی خانوادگی - حضانت فرزند',
        caseNumber: 'CASE-0004-2024',
        type: 'family',
        status: 'PENDING',
        priority: 'MEDIUM',
        description: 'دعوی حضانت فرزند پس از طلاق توافقی. مادر درخواست حضانت انحصاری فرزند ۸ ساله را دارد.',
        summary: 'دعوی حضانت فرزند',
        court: 'دادگاه خانواده تهران',
        courtBranch: 'شعبه ۸',
        clientId: client4.id,
        lawyerId: lawyer1.id,
        tags: '["خانوادگی", "حضانت", "طلاق"]',
      },
    });

    const case5 = await db.legalCase.create({
      data: {
        title: 'دعوی بیمه - عدم پرداخت خسارت',
        caseNumber: 'CASE-0005-2024',
        type: 'civil',
        status: 'CLOSED',
        priority: 'MEDIUM',
        description: 'دعوی علیه شرکت بیمه به دلیل عدم پرداخت خسارت تصادف رانندگی. پرونده با توافق طرفین بسته شد.',
        summary: 'دعوی بیمه خسارت تصادف',
        court: 'دادگاه حقوقی تهران',
        courtBranch: 'شعبه ۲۳',
        clientId: client5.id,
        lawyerId: lawyer1.id,
        closedAt: new Date('2024-06-01'),
        closedReason: 'توافق طرفین',
        tags: '["بیمه", "خسارت", "تصادف"]',
      },
    });

    // ============ CREATE APPOINTMENTS ============

    await Promise.all([
      db.appointment.create({
        data: {
          title: 'مشاوره حقوقی اولیه',
          description: 'بررسی اولیه پرونده ملکی و ارائه راهکار',
          date: new Date('2024-07-15'),
          startTime: '10:00',
          endTime: '11:00',
          status: 'CONFIRMED',
          type: 'IN_PERSON',
          lawyerId: lawyer1.id,
          clientId: client1.id,
        },
      }),
      db.appointment.create({
        data: {
          title: 'جلسه بررسی مدارک کیفری',
          description: 'بررسی مدارک و شواهد پرونده کلاهبرداری',
          date: new Date('2024-07-20'),
          startTime: '14:00',
          endTime: '15:30',
          status: 'CONFIRMED',
          type: 'IN_PERSON',
          lawyerId: lawyer2.id,
          clientId: client2.id,
        },
      }),
      db.appointment.create({
        data: {
          title: 'مشاوره آنلاین قرارداد',
          description: 'مشاوره ویدیویی درباره قرارداد تجاری بین‌المللی',
          date: new Date('2024-07-22'),
          startTime: '09:00',
          endTime: '10:00',
          status: 'PENDING',
          type: 'VIDEO',
          lawyerId: lawyer3.id,
          clientId: client3.id,
        },
      }),
      db.appointment.create({
        data: {
          title: 'جلسه پیگیری پرونده خانوادگی',
          description: 'بررسی وضعیت دعوی حضانت',
          date: new Date('2024-07-25'),
          startTime: '11:00',
          endTime: '12:00',
          status: 'PENDING',
          type: 'IN_PERSON',
          lawyerId: lawyer1.id,
          clientId: client4.id,
        },
      }),
      db.appointment.create({
        data: {
          title: 'مشاوره تلفنی بیمه',
          description: 'مشاوره درباره مراحل بعدی پرونده بیمه',
          date: new Date('2024-06-28'),
          startTime: '16:00',
          endTime: '16:30',
          status: 'COMPLETED',
          type: 'PHONE',
          lawyerId: lawyer1.id,
          clientId: client5.id,
        },
      }),
    ]);

    // ============ CREATE INVOICES ============

    const inv1 = await db.invoice.create({
      data: {
        invoiceNumber: 'INV-0001-2024',
        caseId: case1.id,
        clientId: client1.id,
        amount: 50000000,
        tax: 5000000,
        discount: 2500000,
        total: 52500000,
        status: 'PARTIAL',
        dueDate: new Date('2024-03-15'),
        paidAmount: 30000000,
        createdBy: accountant.id,
        notes: 'پیش‌پرداخت و第一阶段 حق‌الوکاله',
      },
    });

    const inv2 = await db.invoice.create({
      data: {
        invoiceNumber: 'INV-0002-2024',
        caseId: case2.id,
        clientId: client2.id,
        amount: 80000000,
        tax: 8000000,
        discount: 0,
        total: 88000000,
        status: 'PENDING',
        dueDate: new Date('2024-04-20'),
        paidAmount: 0,
        createdBy: accountant.id,
        notes: 'حق‌الوکاله پرونده کیفری اورژانسی',
      },
    });

    await db.invoice.create({
      data: {
        invoiceNumber: 'INV-0003-2024',
        caseId: case3.id,
        clientId: client3.id,
        amount: 120000000,
        tax: 12000000,
        discount: 12000000,
        total: 120000000,
        status: 'PAID',
        dueDate: new Date('2024-05-01'),
        paidAmount: 120000000,
        paidAt: new Date('2024-04-28'),
        createdBy: accountant.id,
        notes: 'قرارداد تجاری بین‌المللی - پرداخت کامل',
      },
    });

    await db.invoice.create({
      data: {
        invoiceNumber: 'INV-0004-2024',
        caseId: case4.id,
        clientId: client4.id,
        amount: 35000000,
        tax: 3500000,
        discount: 3500000,
        total: 35000000,
        status: 'PENDING',
        dueDate: new Date('2024-06-01'),
        paidAmount: 0,
        createdBy: accountant.id,
        notes: 'حق‌الوکاله دعوی خانوادگی',
      },
    });

    // ============ CREATE PAYMENTS ============

    await Promise.all([
      db.payment.create({
        data: {
          invoiceId: inv1.id,
          amount: 30000000,
          method: 'BANK_TRANSFER',
          status: 'COMPLETED',
          transactionId: 'TXN-10001',
          description: 'پیش‌پرداخت فاکتور ۰۰۰۱',
          userId: client1.id,
          createdAt: new Date('2024-01-20'),
        },
      }),
      db.payment.create({
        data: {
          invoiceId: inv2.id,
          amount: 20000000,
          method: 'CARD',
          status: 'COMPLETED',
          transactionId: 'TXN-10002',
          description: 'قسط اول فاکتور کیفری',
          userId: client2.id,
          createdAt: new Date('2024-03-05'),
        },
      }),
      db.payment.create({
        data: {
          invoiceId: null,
          amount: 15000000,
          method: 'CASH',
          status: 'COMPLETED',
          description: 'مشاوره حقوقی حضوری',
          userId: client5.id,
          createdAt: new Date('2024-06-25'),
        },
      }),
    ]);

    // ============ CREATE TASKS ============

    await Promise.all([
      db.task.create({
        data: {
          title: 'تهیه لایحه دفاعیه پرونده ملکی',
          description: 'تهیه لایحه دفاعیه کامل برای جلسه دادگاه تاریخ ۱۰ مرداد',
          status: 'IN_PROGRESS',
          priority: 'URGENT',
          dueDate: new Date('2024-08-08'),
          caseId: case1.id,
          assignedTo: lawyer1.id,
          createdBy: manager.id,
        },
      }),
      db.task.create({
        data: {
          title: 'جمع‌آوری مدارک کیفری',
          description: 'جمع‌آوری و بررسی تمام مدارک و شواهد پرونده کلاهبرداری',
          status: 'TODO',
          priority: 'HIGH',
          dueDate: new Date('2024-07-28'),
          caseId: case2.id,
          assignedTo: intern2.id,
          createdBy: lawyer2.id,
        },
      }),
      db.task.create({
        data: {
          title: 'بررسی قرارداد بین‌المللی',
          description: 'بررسی قوانین بین‌المللی و تطابق با حقوق ایران',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          dueDate: new Date('2024-07-30'),
          caseId: case3.id,
          assignedTo: lawyer3.id,
          createdBy: manager.id,
        },
      }),
      db.task.create({
        data: {
          title: 'آماده‌سازی پرونده حضانت',
          description: 'تهیه مدارک لازم برای جلسه دادگاه خانواده',
          status: 'TODO',
          priority: 'MEDIUM',
          dueDate: new Date('2024-07-23'),
          caseId: case4.id,
          assignedTo: intern1.id,
          createdBy: lawyer1.id,
        },
      }),
      db.task.create({
        data: {
          title: 'ثبت صورت‌جلسه دادگاه',
          description: 'ثبت و بایگانی صورت‌جلسه جلسه دادگاه پرونده بیمه',
          status: 'DONE',
          priority: 'LOW',
          caseId: case5.id,
          assignedTo: support.id,
          createdBy: lawyer1.id,
          completedAt: new Date('2024-06-10'),
        },
      }),
    ]);

    // ============ CREATE NOTIFICATIONS ============

    await Promise.all([
      db.notification.create({ data: { userId: lawyer1.id, title: 'جلسه دادگاه نزدیک است', message: 'جلسه بعدی دادگاه پرونده ملکی در تاریخ ۱۰ مرداد برگزار می‌شود', type: 'WARNING', category: 'case' } }),
      db.notification.create({ data: { userId: lawyer2.id, title: 'مدارک جدید بارگذاری شد', message: 'مدارک جدیدی برای پرونده کیفری توسط کارشناس بارگذاری شده', type: 'INFO', category: 'case' } }),
      db.notification.create({ data: { userId: client1.id, title: 'فاکتور جدید', message: 'فاکتور جدیدی برای پرونده حقوقی شما صادر شده است', type: 'INFO', category: 'payment' } }),
      db.notification.create({ data: { userId: manager.id, title: 'گزارش هفتگی', message: 'گزارش عملکرد هفته گذشته آماده مشاهده است', type: 'INFO', category: 'system' } }),
      db.notification.create({ data: { userId: intern1.id, title: 'وظیفه جدید', message: 'وظیفه جدیدی به شما اختصاص یافت: آماده‌سازی پرونده حضانت', type: 'INFO', category: 'system' } }),
      db.notification.create({ data: { userId: accountant.id, title: 'پرداخت جدید', message: 'یک پرداخت جدید ثبت شده و نیاز به بررسی دارد', type: 'INFO', category: 'payment' } }),
    ]);

    // ============ CREATE POSTS ============

    await Promise.all([
      db.post.create({
        data: {
          authorId: lawyer1.id,
          title: 'راهنمای حقوقی: حقوق مستأجر و موجر',
          content: 'در این مقاله به بررسی حقوق قانونی مستأجر و موجر می‌پردازیم. طبق قانون روابط موجر و مستأجر مصوب ۱۳۷۶، هر دو طرف تعهدات خاصی دارند...',
          type: 'ARTICLE',
          tags: '["حقوق مدنی", "مستأجر", "موجر"]',
          likes: 45,
        },
      }),
      db.post.create({
        data: {
          authorId: lawyer2.id,
          title: 'آشنایی با جرم کلاهبرداری و مجازات آن',
          content: 'کلاهبرداری یکی از جرایم مهم علیه اموال و مالیت اشخاص است. طبق ماده ۱ قانون تشدید مجازات مرتکبین ارتشاء و اختلاس و کلاهبرداری...',
          type: 'KNOWLEDGE',
          tags: '["کیفری", "کلاهبرداری", "قانون"]',
          likes: 32,
        },
      }),
      db.post.create({
        data: {
          authorId: lawyer3.id,
          content: 'آیا شرکت شما نیاز به بازبینی قراردادهای تجاری دارد؟ با توجه به تغییرات اخیر در قوانین تجارت، پیشنهاد می‌کنم قراردادهای فعلی خود را بررسی کنید.',
          type: 'DISCUSSION',
          tags: '["تجاری", "قرارداد"]',
          likes: 18,
        },
      }),
      db.post.create({
        data: {
          authorId: admin.id,
          title: 'اطلاعیه: سیستم جدید مدیریت پرونده‌ها',
          content: 'با افتخار اعلام می‌کنیم سیستم جدید مدیریت پرونده‌های LegalHub راه‌اندازی شده است. این سیستم امکانات جدیدی از جمله...',
          type: 'ANNOUNCEMENT',
          tags: '["سیستم", "آپدیت"]',
          isPinned: true,
          likes: 28,
        },
      }),
      db.post.create({
        data: {
          authorId: intern1.id,
          title: 'سؤال: تفاوت دعوای حقوقی و کیفری چیست؟',
          content: 'به عنوان دانشجوی حقوق، می‌خواهم بدانم تفاوت اصلی بین دعوای حقوقی و کیفری چیست و در چه شرایطی باید هر کدام را مطرح کرد؟',
          type: 'QUESTION',
          tags: '["حقوق", "کیفری", "آموزش"]',
          likes: 12,
        },
      }),
    ]);

    // ============ CREATE MESSAGES ============

    await Promise.all([
      db.message.create({
        data: {
          senderId: client1.id,
          receiverId: lawyer1.id,
          content: 'سلام جناب آقای کریمی، وضعیت پرونده ملکی چگونه است؟',
          type: 'TEXT',
          isRead: true,
          readAt: new Date('2024-07-10'),
        },
      }),
      db.message.create({
        data: {
          senderId: lawyer1.id,
          receiverId: client1.id,
          content: 'سلام خانم جعفری، پرونده در حال بررسی است. لایحه دفاعیه در حال آماده‌سازی می‌باشد و تا پیش از جلسه دادگاه تکمیل خواهد شد.',
          type: 'TEXT',
          isRead: true,
          readAt: new Date('2024-07-10'),
        },
      }),
      db.message.create({
        data: {
          senderId: client2.id,
          receiverId: lawyer2.id,
          content: 'آیا امکان ملاقات حضوری قبل از جلسه بعدی دادگاه وجود دارد؟',
          type: 'TEXT',
          isRead: false,
        },
      }),
      db.message.create({
        data: {
          senderId: lawyer3.id,
          receiverId: client3.id,
          content: 'قرارداد اولیه آماده شد. لطفاً بخش مربوط به arbitration را بررسی کنید.',
          type: 'TEXT',
          isRead: false,
        },
      }),
      db.message.create({
        data: {
          senderId: manager.id,
          receiverId: lawyer1.id,
          content: 'لطفاً گزارش ماهانه پرونده‌های خود را تا پایان هفته ارسال کنید.',
          type: 'TEXT',
          isRead: true,
          readAt: new Date('2024-07-08'),
        },
      }),
    ]);

    // ============ CREATE LEADS ============

    await Promise.all([
      db.lead.create({
        data: {
          assignedToId: lawyer1.id,
          name: 'شرکت ساختمانی آسمان',
          email: 'info@aseman-co.ir',
          phone: '02188776655',
          source: 'وبسایت',
          status: 'QUALIFIED',
          notes: 'نیاز به مشاوره حقوقی در پروژه ساختمانی بزرگ',
          value: 200000000,
        },
      }),
      db.lead.create({
        data: {
          assignedToId: lawyer2.id,
          name: 'خانم پرمهر',
          email: 'parmehr@email.com',
          phone: '09351234567',
          source: 'ارجاع',
          status: 'NEW',
          notes: 'مشکلات حقوقی در زمینه ارث',
        },
      }),
      db.lead.create({
        data: {
          assignedToId: lawyer3.id,
          name: 'هلدینگ سرمایه‌گذاری نور',
          email: 'contact@noor-holding.com',
          phone: '02122334455',
          source: 'لینکدین',
          status: 'CONTACTED',
          notes: 'نیاز به مشاوره حقوق تجارت بین‌الملل',
          value: 500000000,
        },
      }),
      db.lead.create({
        data: {
          assignedToId: lawyer1.id,
          name: 'آقای رستمی',
          email: null,
          phone: '09191112233',
          source: 'تلفنی',
          status: 'NEW',
          notes: 'دعوی ملکی در شهرستان',
        },
      }),
    ]);

    // ============ CREATE CALENDAR EVENTS ============

    await Promise.all([
      db.calendarEvent.create({
        data: {
          userId: lawyer1.id,
          title: 'جلسه دادگاه - پرونده ملکی',
          description: 'شعبه ۱۲ دادگاه حقوقی تهران',
          date: new Date('2024-08-10'),
          startTime: '09:00',
          endTime: '12:00',
          type: 'HEARING',
          color: '#ef4444',
        },
      }),
      db.calendarEvent.create({
        data: {
          userId: lawyer2.id,
          title: 'جلسه دادگاه - پرونده کیفری',
          description: 'شعبه ۵ دادگاه کیفری تهران',
          date: new Date('2024-07-25'),
          startTime: '10:00',
          endTime: '13:00',
          type: 'HEARING',
          color: '#ef4444',
        },
      }),
      db.calendarEvent.create({
        data: {
          userId: manager.id,
          title: 'جلسه هفتگی مدیریت',
          description: 'بررسی وضعیت پرونده‌ها و منابع انسانی',
          date: new Date('2024-07-15'),
          startTime: '08:30',
          endTime: '10:00',
          type: 'MEETING',
          color: '#3b82f6',
        },
      }),
      db.calendarEvent.create({
        data: {
          userId: lawyer3.id,
          title: 'مهلت ارسال قرارداد',
          description: 'مهلت ارسال نسخه نهایی قرارداد به شرکای خارجی',
          date: new Date('2024-07-30'),
          type: 'DEADLINE',
          color: '#f59e0b',
        },
      }),
      db.calendarEvent.create({
        data: {
          userId: accountant.id,
          title: 'ارسال گزارش مالی ماهانه',
          description: 'تهیه و ارسال گزارش مالی تیرماه',
          date: new Date('2024-07-31'),
          type: 'TASK',
          color: '#10b981',
        },
      }),
    ]);

    // ============ CREATE TIME ENTRIES ============

    await Promise.all([
      db.timeEntry.create({
        data: {
          userId: lawyer1.id,
          caseId: case1.id,
          date: new Date('2024-07-08'),
          hours: 3.5,
          description: 'بررسی مدارک و تهیه پیش‌نویس لایحه دفاعیه',
          isBilled: false,
        },
      }),
      db.timeEntry.create({
        data: {
          userId: lawyer1.id,
          caseId: case1.id,
          date: new Date('2024-07-09'),
          hours: 4,
          description: 'جلسه با موکل و بررسی جزئیات پرونده',
          isBilled: false,
        },
      }),
      db.timeEntry.create({
        data: {
          userId: lawyer2.id,
          caseId: case2.id,
          date: new Date('2024-07-07'),
          hours: 5,
          description: 'بررسی شواهد و مصاحبه با شاهدان',
          isBilled: false,
        },
      }),
      db.timeEntry.create({
        data: {
          userId: lawyer2.id,
          caseId: case2.id,
          date: new Date('2024-07-10'),
          hours: 2.5,
          description: 'مشاوره با کارشناس حقوقی',
          isBilled: false,
        },
      }),
      db.timeEntry.create({
        data: {
          userId: lawyer3.id,
          caseId: case3.id,
          date: new Date('2024-07-11'),
          hours: 6,
          description: 'بررسی قوانین بین‌المللی و تنظیم قرارداد',
          isBilled: false,
        },
      }),
      db.timeEntry.create({
        data: {
          userId: intern1.id,
          caseId: case1.id,
          date: new Date('2024-07-09'),
          hours: 2,
          description: 'جستجوی رویه قضایی و تهیه خلاصه',
          isBilled: false,
        },
      }),
      db.timeEntry.create({
        data: {
          userId: intern2.id,
          caseId: case2.id,
          date: new Date('2024-07-10'),
          hours: 3,
          description: 'طبقه‌بندی و بایگانی مدارک',
          isBilled: false,
        },
      }),
    ]);

    // ============ CREATE DOCUMENTS ============

    await Promise.all([
      db.document.create({
        data: {
          name: 'لایحه دفاعیه پرونده ملکی.pdf',
          type: 'application/pdf',
          filePath: '/uploads/documents/case1-defense.pdf',
          fileSize: 2048000,
          mimeType: 'application/pdf',
          category: 'legal',
          tags: '["ملکی", "دفاعیه"]',
          uploadedBy: lawyer1.id,
        },
      }),
      db.document.create({
        data: {
          name: 'قرارداد تجاری بین‌المللی.docx',
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          filePath: '/uploads/documents/intl-contract.docx',
          fileSize: 1536000,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          category: 'contract',
          tags: '["تجاری", "بین‌المللی"]',
          uploadedBy: lawyer3.id,
        },
      }),
      db.document.create({
        data: {
          name: 'گزارش مالی تیرماه.xlsx',
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          filePath: '/uploads/documents/financial-report-tir.xlsx',
          fileSize: 512000,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          category: 'financial',
          tags: '["مالی", "گزارش"]',
          uploadedBy: accountant.id,
        },
      }),
      db.document.create({
        data: {
          name: 'رأی دادگاه بیمه.pdf',
          type: 'application/pdf',
          filePath: '/uploads/documents/case5-verdict.pdf',
          fileSize: 1024000,
          mimeType: 'application/pdf',
          category: 'legal',
          tags: '["بیمه", "رأی"]',
          uploadedBy: support.id,
        },
      }),
    ]);

    // ============ CREATE COURSES ============

    const course1 = await db.course.create({
      data: {
        title: 'آشنایی با حقوق تجارت ایران',
        description: 'دوره جامع حقوق تجارت ایران شامل شرکت‌ها، اسناد تجاری، ورشکستگی و قراردادهای تجاری',
        instructorId: lawyer3.id,
        type: 'COURSE',
        status: 'PUBLISHED',
        duration: 480,
      },
    });

    const course2 = await db.course.create({
      data: {
        title: 'حقوق کیفری: جرم کلاهبرداری',
        description: 'بررسی کامل جرم کلاهبرداری، عناصر تشکیل‌دهنده و مجازات‌های مربوطه',
        instructorId: lawyer2.id,
        type: 'COURSE',
        status: 'PUBLISHED',
        duration: 360,
      },
    });

    const course3 = await db.course.create({
      data: {
        title: 'وبینار: آخرین تغییرات قانون کار',
        description: 'بررسی آخرین اصلاحات قانون کار و تأثیر آن بر روابط کارگر و کارفرما',
        instructorId: lawyer1.id,
        type: 'WEBINAR',
        status: 'DRAFT',
        duration: 120,
      },
    });

    // Course lessons
    await Promise.all([
      db.lesson.create({
        data: {
          courseId: course1.id,
          title: 'مقدمه حقوق تجارت',
          content: 'تعریف تجارت و تاجر...',
          order: 1,
          duration: 45,
        },
      }),
      db.lesson.create({
        data: {
          courseId: course1.id,
          title: 'شرکت‌های تجاری',
          content: 'انواع شرکت‌ها در قانون تجارت...',
          order: 2,
          duration: 60,
        },
      }),
      db.lesson.create({
        data: {
          courseId: course2.id,
          title: 'تعریف و عناصر کلاهبرداری',
          content: 'ماده ۱ قانون تشدید مجازات...',
          order: 1,
          duration: 45,
        },
      }),
    ]);

    // Enrollments
    await Promise.all([
      db.enrollment.create({ data: { userId: intern1.id, courseId: course1.id, status: 'ACTIVE', progress: 35 } }),
      db.enrollment.create({ data: { userId: intern2.id, courseId: course2.id, status: 'ACTIVE', progress: 60 } }),
      db.enrollment.create({ data: { userId: lawyer1.id, courseId: course2.id, status: 'ACTIVE', progress: 10 } }),
    ]);

    // ============ CREATE SESSIONS (for easy login) ============

    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.session.create({
      data: {
        userId: admin.id,
        token,
        expiresAt,
        userAgent: 'seed-script',
      },
    });

    // ============ CREATE SETTINGS ============

    await Promise.all([
      db.setting.create({ data: { key: 'app_name', value: 'LegalHub - سامانه مدیریت حقوقی' } }),
      db.setting.create({ data: { key: 'default_hourly_rate', value: '2500000' } }),
      db.setting.create({ data: { key: 'currency', value: 'IRR' } }),
      db.setting.create({ data: { key: 'working_hours_start', value: '08:00' } }),
      db.setting.create({ data: { key: 'working_hours_end', value: '17:00' } }),
    ]);

    return NextResponse.json({
      message: 'داده‌های نمونه با موفقیت ایجاد شدند',
      stats: {
        users: 14,
        cases: 5,
        appointments: 5,
        invoices: 4,
        payments: 3,
        tasks: 5,
        notifications: 6,
        posts: 5,
        messages: 5,
        leads: 4,
        calendarEvents: 5,
        timeEntries: 7,
        documents: 4,
        courses: 3,
      },
      loginInfo: {
        email: 'admin@legalhub.ir',
        password: '123456',
        token,
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد داده‌های نمونه', details: String(error) },
      { status: 500 }
    );
  }
}
