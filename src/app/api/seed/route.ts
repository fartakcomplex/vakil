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
        tags: '"ملکی", "زمین", "تجاری"',
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
        tags: '"کیفری", "کلاهبرداری", "مالی"',
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
        tags: '"تجاری", "بین‌المللی", "قرارداد"',
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
        tags: '"خانوادگی", "حضانت", "طلاق"',
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
        tags: '"بیمه", "خسارت", "تصادف"',
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
          tags: '"حقوق مدنی", "مستأجر", "موجر"',
          likes: 45,
        },
      }),
      db.post.create({
        data: {
          authorId: lawyer2.id,
          title: 'آشنایی با جرم کلاهبرداری و مجازات آن',
          content: 'کلاهبرداری یکی از جرایم مهم علیه اموال و مالیت اشخاص است. طبق ماده ۱ قانون تشدید مجازات مرتکبین ارتشاء و اختلاس و کلاهبرداری...',
          type: 'KNOWLEDGE',
          tags: '"کیفری", "کلاهبرداری", "قانون"',
          likes: 32,
        },
      }),
      db.post.create({
        data: {
          authorId: lawyer3.id,
          content: 'آیا شرکت شما نیاز به بازبینی قراردادهای تجاری دارد؟ با توجه به تغییرات اخیر در قوانین تجارت، پیشنهاد می‌کنم قراردادهای فعلی خود را بررسی کنید.',
          type: 'DISCUSSION',
          tags: '"تجاری", "قرارداد"',
          likes: 18,
        },
      }),
      db.post.create({
        data: {
          authorId: admin.id,
          title: 'اطلاعیه: سیستم جدید مدیریت پرونده‌ها',
          content: 'با افتخار اعلام می‌کنیم سیستم جدید مدیریت پرونده‌های LegalHub راه‌اندازی شده است. این سیستم امکانات جدیدی از جمله...',
          type: 'ANNOUNCEMENT',
          tags: '"سیستم", "آپدیت"',
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
          tags: '"حقوق", "کیفری", "آموزش"',
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
          tags: '"ملکی", "دفاعیه"',
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
          tags: '"تجاری", "بین‌المللی"',
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
          tags: '"مالی", "گزارش"',
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
          tags: '"بیمه", "رأی"',
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
      db.enrollment.create({ data: { userId: manager.id, courseId: course1.id, status: 'COMPLETED', progress: 100, completedAt: new Date('2024-05-01') } }),
      db.enrollment.create({ data: { userId: support.id, courseId: course2.id, status: 'ACTIVE', progress: 20 } }),
    ]);

    // ============ EXTRA CASES ============
    const case6 = await db.legalCase.create({
      data: {
        title: 'دعوی ملکی - تخریب دیوار مشترک',
        caseNumber: 'CASE-0006-2024',
        type: 'civil',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        description: 'دعوی مربوط به تخریب دیوار مشترک بین دو ملک مجاور توسط همسایه. خواهان تقاضای جبران خسارت و بازسازی دیوار را دارد.',
        summary: 'تخریب دیوار مشترک بین دو ملک',
        court: 'دادگاه حقوقی تهران',
        courtBranch: 'شعبه ۷',
        judgeName: 'قاضی احمدی',
        filingDate: new Date('2024-03-10'),
        nextHearing: new Date('2024-08-15'),
        clientId: client1.id,
        lawyerId: lawyer1.id,
        internId: intern1.id,
        tags: '"ملکی", "دیوار مشترک", "خسارت"',
      },
    });

    const case7 = await db.legalCase.create({
      data: {
        title: 'پرونده ابطال سند معارض',
        caseNumber: 'CASE-0007-2024',
        type: 'civil',
        status: 'OPEN',
        priority: 'HIGH',
        description: 'درخواست ابطال سند مالکیت معارض صادره برای قطعه زمینی در منطقه ۵ تهران. خواهان ادعا دارد سند خوانده جعلی و با اسناد مالکیت قبلی مغایرت دارد.',
        summary: 'ابطال سند مالکیت معارض زمین',
        court: 'دادگاه حقوقی تهران',
        courtBranch: 'شعبه ۱۸',
        clientId: client4.id,
        lawyerId: lawyer1.id,
        tags: '"ملکی", "سند معارض", "ابطال"',
      },
    });

    const case8 = await db.legalCase.create({
      data: {
        title: 'پرونده اختلاف شرکا',
        caseNumber: 'CASE-0008-2024',
        type: 'corporate',
        status: 'PENDING',
        priority: 'HIGH',
        description: 'اختلاف بین سهامداران شرکت فناوری اطلاعات پارس ناشی از عدم توزیع سود و تصمیمات unilateral هیئت مدیره.',
        summary: 'اختلاف شرکا در شرکت IT',
        court: 'دادگاه حقوقی تهران',
        courtBranch: 'شعبه ۳',
        clientId: client1.id,
        lawyerId: lawyer3.id,
        internId: intern1.id,
        tags: '"شرکتی", "اختلاف شرکا", "سهام"',
      },
    });

    const case9 = await db.legalCase.create({
      data: {
        title: 'دعوی مطالبه وجه قرارداد پیمانکاری',
        caseNumber: 'CASE-0009-2024',
        type: 'labor',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        description: 'مطالبه مطالبات معوق پیمانکار از کارفرما بابت اجرای پروژه ساختمانی. مبلغ مورد مطالبه ۲ میلیارد و ۵۰۰ میلیون تومان.',
        summary: 'مطالبه وجه پیمانکاری ساختمانی',
        court: 'دیوان عدالت اداری',
        courtBranch: 'شعبه ۹',
        clientId: client2.id,
        lawyerId: lawyer2.id,
        tags: '"کار", "پیمانکاری", "مطالبه وجه"',
      },
    });

    const case10 = await db.legalCase.create({
      data: {
        title: 'دعوی حقوق ناشی از تصادف رانندگی',
        caseNumber: 'CASE-0010-2024',
        type: 'civil',
        status: 'IN_PROGRESS',
        priority: 'LOW',
        description: 'دعوی مطالبه غرامات و خسارت ناشی از تصادف رانندگی منجر به آسیب‌دیدگی و خسارت وسیله نقلیه.',
        summary: 'خسارت تصادف رانندگی',
        court: 'دادگاه حقوقی اصفهان',
        courtBranch: 'شعبه ۴',
        clientId: client3.id,
        lawyerId: lawyer1.id,
        tags: '"ملکی", "تصادف", "غرامت"',
      },
    });

    // ============ EXTRA APPOINTMENTS ============
    await Promise.all([
      db.appointment.create({ data: { title: 'مشاوره حقوقی - دعوی ملکی', description: 'بررسی دقیق پرونده تخریب دیوار مشترک', date: new Date('2024-08-05'), startTime: '09:30', endTime: '10:30', status: 'PENDING', type: 'IN_PERSON', lawyerId: lawyer1.id, clientId: client1.id } }),
      db.appointment.create({ data: { title: 'جلسه ویدئویی بررسی قرارداد', description: 'بررسی نهایی بندهای قرارداد بین‌المللی', date: new Date('2024-08-02'), startTime: '15:00', endTime: '16:00', status: 'CONFIRMED', type: 'VIDEO', lawyerId: lawyer3.id, clientId: client3.id } }),
      db.appointment.create({ data: { title: 'مشاوره تلفنی - اختلاف شرکا', description: 'توضیح روند حقوقی پرونده شرکا', date: new Date('2024-08-08'), startTime: '11:00', endTime: '11:30', status: 'PENDING', type: 'PHONE', lawyerId: lawyer3.id, clientId: client1.id } }),
      db.appointment.create({ data: { title: 'جلسه حضوری - پرونده کار', description: 'بررسی مدارک و شواهد پرونده مطالبه وجه', date: new Date('2024-08-12'), startTime: '10:00', endTime: '11:30', status: 'PENDING', type: 'IN_PERSON', lawyerId: lawyer2.id, clientId: client2.id } }),
      db.appointment.create({ data: { title: 'ویدئو کنفرانس - تصادف', description: 'مشاوره درباره روند رسیدگی به خسارت تصادف', date: new Date('2024-08-06'), startTime: '14:00', endTime: '15:00', status: 'CONFIRMED', type: 'VIDEO', lawyerId: lawyer1.id, clientId: client3.id } }),
      db.appointment.create({ data: { title: 'مشاوره اولیه حقوقی', description: 'ثبت‌نام اولیه و بررسی نوع دعوی', date: new Date('2024-07-30'), startTime: '08:30', endTime: '09:00', status: 'COMPLETED', type: 'IN_PERSON', lawyerId: lawyer1.id, clientId: client4.id } }),
      db.appointment.create({ data: { title: 'پیگیری پرونده سند معارض', description: 'بررسی آخرین وضعیت پرونده ابطال سند', date: new Date('2024-08-01'), startTime: '16:00', endTime: '17:00', status: 'CONFIRMED', type: 'IN_PERSON', lawyerId: lawyer1.id, clientId: client4.id } }),
    ]);

    // ============ EXTRA INVOICES & PAYMENTS ============
    const inv5 = await db.invoice.create({
      data: { invoiceNumber: 'INV-0005-2024', caseId: case6.id, clientId: client1.id, amount: 25000000, tax: 2500000, discount: 0, total: 27500000, status: 'PAID', dueDate: new Date('2024-06-01'), paidAmount: 27500000, paidAt: new Date('2024-05-28'), createdBy: accountant.id, notes: 'حق‌الوکاله پرونده تخریب دیوار مشترک' },
    });
    const inv6 = await db.invoice.create({
      data: { invoiceNumber: 'INV-0006-2024', caseId: case7.id, clientId: client4.id, amount: 45000000, tax: 4500000, discount: 4500000, total: 45000000, status: 'PENDING', dueDate: new Date('2024-08-15'), paidAmount: 0, createdBy: accountant.id, notes: 'حق‌الوکاله پرونده ابطال سند معارض' },
    });
    const inv7 = await db.invoice.create({
      data: { invoiceNumber: 'INV-0007-2024', caseId: case8.id, clientId: client1.id, amount: 95000000, tax: 9500000, discount: 9500000, total: 85000000, status: 'PARTIAL', dueDate: new Date('2024-07-20'), paidAmount: 40000000, createdBy: accountant.id, notes: 'حق‌الوکاله اختلاف شرکا - پرداخت اقساطی' },
    });
    const inv8 = await db.invoice.create({
      data: { invoiceNumber: 'INV-0008-2024', caseId: case9.id, clientId: client2.id, amount: 65000000, tax: 6500000, discount: 0, total: 71500000, status: 'PENDING', dueDate: new Date('2024-09-01'), paidAmount: 0, createdBy: accountant.id, notes: 'حق‌الوکاله پرونده مطالبه وجه پیمانکاری' },
    });
    const inv9 = await db.invoice.create({
      data: { invoiceNumber: 'INV-0009-2024', caseId: case10.id, clientId: client3.id, amount: 18000000, tax: 1800000, discount: 1800000, total: 16200000, status: 'OVERDUE', dueDate: new Date('2024-06-15'), paidAmount: 0, createdBy: accountant.id, notes: 'حق‌الوکاله پرونده تصادف - سررسید گذشته' },
    });

    await Promise.all([
      db.payment.create({ data: { invoiceId: inv5.id, amount: 27500000, method: 'BANK_TRANSFER', status: 'COMPLETED', transactionId: 'TXN-10005', description: 'پرداخت کامل فاکتور تخریب دیوار', userId: client1.id, createdAt: new Date('2024-05-28') } }),
      db.payment.create({ data: { invoiceId: inv7.id, amount: 20000000, method: 'CARD', status: 'COMPLETED', transactionId: 'TXN-10006', description: 'قسط اول اختلاف شرکا', userId: client1.id, createdAt: new Date('2024-06-10') } }),
      db.payment.create({ data: { invoiceId: inv7.id, amount: 20000000, method: 'WALLET', status: 'COMPLETED', transactionId: 'TXN-10007', description: 'قسط دوم اختلاف شرکا', userId: client1.id, createdAt: new Date('2024-07-05') } }),
      db.payment.create({ data: { invoiceId: null, amount: 5000000, method: 'CARD', status: 'COMPLETED', description: 'مشاوره حقوقی پرونده کار', userId: client2.id, createdAt: new Date('2024-07-15') } }),
      db.payment.create({ data: { invoiceId: null, amount: 8000000, method: 'CASH', status: 'COMPLETED', description: 'مشاوره اولیه حضوری', userId: client4.id, createdAt: new Date('2024-07-20') } }),
    ]);

    // Wallet transactions
    await Promise.all([
      db.walletTransaction.create({ data: { userId: client1.id, amount: 100000000, type: 'DEPOSIT', description: 'واریز به کیف پول', balance: 100000000 } }),
      db.walletTransaction.create({ data: { userId: client1.id, amount: 20000000, type: 'PAYMENT', description: 'پرداخت فاکتور INV-0007', referenceId: inv7.id, balance: 80000000 } }),
      db.walletTransaction.create({ data: { userId: client2.id, amount: 50000000, type: 'DEPOSIT', description: 'واریز به کیف پول', balance: 50000000 } }),
      db.walletTransaction.create({ data: { userId: client3.id, amount: 30000000, type: 'DEPOSIT', description: 'واریز به کیف پول', balance: 30000000 } }),
    ]);

    // ============ EXTRA TASKS ============
    await Promise.all([
      db.task.create({ data: { title: 'تهیه گزارش ماهانه عملکرد', description: 'تهیه گزارش عملکرد وکلای مجموعه برای تیرماه', status: 'TODO', priority: 'HIGH', dueDate: new Date('2024-08-01'), assignedTo: manager.id, createdBy: admin.id } }),
      db.task.create({ data: { title: 'بازبینی قراردادهای موجود', description: 'بررسی و آپدیت قالب قراردادهای داخلی مجموعه', status: 'IN_PROGRESS', priority: 'MEDIUM', dueDate: new Date('2024-08-10'), assignedTo: lawyer3.id, createdBy: manager.id } }),
      db.task.create({ data: { title: 'ثبت اظهارنامه مالیاتی', description: 'تهیه و ارسال اظهارنامه مالیاتی ترم دوم', status: 'TODO', priority: 'URGENT', dueDate: new Date('2024-07-31'), assignedTo: accountant.id, createdBy: manager.id } }),
      db.task.create({ data: { title: 'پاسخگویی به تیکت‌های پشتیبانی', description: 'بررسی و پاسخگویی به ۸ تیکت باز پشتیبانی', status: 'IN_PROGRESS', priority: 'MEDIUM', assignedTo: support.id, createdBy: manager.id } }),
      db.task.create({ data: { title: 'جستجوی رویه قضایی پرونده ابطال سند', description: 'جستجوی آرای مشابه و رویه قضایی مرتبط', status: 'TODO', priority: 'HIGH', dueDate: new Date('2024-08-05'), caseId: case7.id, assignedTo: intern1.id, createdBy: lawyer1.id } }),
      db.task.create({ data: { title: 'تهیه لیست شاهدان پرونده کیفری', description: 'فهرست و تماس با شاهدان پرونده کلاهبرداری', status: 'DONE', priority: 'HIGH', caseId: case2.id, assignedTo: intern2.id, createdBy: lawyer2.id, completedAt: new Date('2024-07-12') } }),
      db.task.create({ data: { title: 'مشاهده دوره حقوق تجارت', description: 'تکمیل جلسات باقیمانده دوره آموزشی', status: 'IN_PROGRESS', priority: 'LOW', dueDate: new Date('2024-08-20'), assignedTo: intern1.id, createdBy: intern1.id } }),
      db.task.create({ data: { title: 'به‌روزرسانی پروفایل وکلا', description: 'بررسی و تکمیل اطلاعات پروفایل وکلا در سامانه', status: 'TODO', priority: 'LOW', assignedTo: lawyer1.id, createdBy: manager.id } }),
    ]);

    // ============ EXTRA NOTIFICATIONS ============
    await Promise.all([
      db.notification.create({ data: { userId: lawyer1.id, title: 'مهلت نزدیک است', message: 'مهلت ارسال لایحه دفاعیه پرونده ملکی تا ۵ روز دیگر', type: 'WARNING', category: 'case' } }),
      db.notification.create({ data: { userId: lawyer2.id, title: 'جلسه جدید تعیین شد', message: 'جلسه بعدی دادگاه کیفری تاریخ ۲۵ مرداد تعیین شد', type: 'INFO', category: 'case' } }),
      db.notification.create({ data: { userId: client1.id, title: 'وضعیت فاکتور', message: 'فاکتور INV-0007 دارای مانده پرداخت است', type: 'WARNING', category: 'payment' } }),
      db.notification.create({ data: { userId: manager.id, title: 'گزارش آماده', message: 'گزارش مالی تیرماه آماده مشاهده است', type: 'INFO', category: 'system' } }),
      db.notification.create({ data: { userId: accountant.id, title: 'فاکتور سررسید گذشته', message: 'فاکتور INV-0009 سررسید پرداخت گذشته و نیاز به پیگیری دارد', type: 'ERROR', category: 'payment' } }),
      db.notification.create({ data: { userId: support.id, title: 'تیکت جدید', message: 'تیکت جدید از سوی خانم طاهری ثبت شد', type: 'INFO', category: 'system' } }),
      db.notification.create({ data: { userId: intern1.id, title: 'دوره جدید', message: 'دوره جدید حقوق تجارت بین‌الملل منتشر شد', type: 'INFO', category: 'system' } }),
      db.notification.create({ data: { userId: client2.id, title: 'پرداخت تأیید شد', message: 'پرداخت شما بابت مشاوره حقوقی با موفقیت ثبت شد', type: 'SUCCESS', category: 'payment' } }),
      db.notification.create({ data: { userId: admin.id, title: 'سیستم آپدیت شد', message: 'نسخه جدید پلتفرم با قابلیت‌های جدید منتشر شد', type: 'INFO', category: 'system' } }),
      db.notification.create({ data: { userId: lawyer3.id, title: 'قرارداد جدید', message: 'درخواست بازبینی قرارداد جدید از سوی هلدینگ نور دریافت شد', type: 'INFO', category: 'case' } }),
    ]);

    // ============ EXTRA MESSAGES ============
    await Promise.all([
      db.message.create({ data: { senderId: lawyer1.id, receiverId: client1.id, content: 'خانم جعفری، جلسه بعدی دادگاه در تاریخ ۱۵ مرداد برگزار خواهد شد. لطفاً مدارک جدید را آماده کنید.', type: 'TEXT' } }),
      db.message.create({ data: { senderId: client1.id, receiverId: lawyer1.id, content: 'بسیار خوب جناب آقای کریمی. مدارک مربوط به سند مالکیت و عکس‌های دیوار را فردا ارسال می‌کنم.', type: 'TEXT' } }),
      db.message.create({ data: { senderId: client3.id, receiverId: lawyer3.id, content: 'جناب آقای نوری، آیا جلسه ویدئویی روز شنبه هنوز تأیید شده است؟', type: 'TEXT' } }),
      db.message.create({ data: { senderId: lawyer3.id, receiverId: client3.id, content: 'بله، جلسه تأیید شده است. لطفاً ۱۰ دقیقه قبل وارد شوید.', type: 'TEXT', isRead: true, readAt: new Date('2024-07-28') } }),
      db.message.create({ data: { senderId: lawyer2.id, receiverId: client2.id, content: 'آقای صادقی، گزارش پیشرفت پرونده کیفری آماده شده. برای مشاهده به بخش پرونده‌ها مراجعه کنید.', type: 'TEXT' } }),
      db.message.create({ data: { senderId: client4.id, receiverId: lawyer1.id, content: 'سلام، برای پرونده ابطال سند مدارک جدیدی پیدا کردم. کجا می‌توانم آپلود کنم؟', type: 'TEXT' } }),
      db.message.create({ data: { senderId: lawyer1.id, receiverId: client4.id, content: 'سلام آقای عباسی، از پورتال مشتریان وارد شوید و از بخش اسناد فایل‌ها را آپلود کنید.', type: 'TEXT', isRead: true, readAt: new Date('2024-07-25') } }),
      db.message.create({ data: { senderId: manager.id, receiverId: lawyer1.id, content: 'آقای کریمی، لطفاً تا پایان هفته لیست پرونده‌های نیازمند بررسی اولیه را ارسال کنید.', type: 'TEXT' } }),
      db.message.create({ data: { senderId: intern1.id, receiverId: lawyer1.id, content: 'استاد، رویه قضایی پرونده ابطال سند را جستجو کردم. ۳ رأی مرتبط پیدا شد.', type: 'TEXT' } }),
      db.message.create({ data: { senderId: client5.id, receiverId: lawyer1.id, content: 'ممنون بابت پیگیری پرونده بیمه. رضایت کامل دارم.', type: 'TEXT', isRead: true, readAt: new Date('2024-06-30') } }),
    ]);

    // ============ EXTRA POSTS ============
    await Promise.all([
      db.post.create({ data: { authorId: lawyer1.id, title: "راهنمای کامل ثبت دعوی حقوقی", content: "در این مقاله جامع، مراحل ثبت دعوی حقوقی در دادگاه‌های ایران را به صورت گام‌به‌گام بررسی می‌کنیم.", type: "ARTICLE", tags: '["آموزش", "حقوقی", "دعوی"]', likes: 67 } }),
      db.post.create({ data: { authorId: lawyer2.id, title: "تفاوت سرقت و کلاهبرداری", content: "یکی از سؤالات رایج در حقوق کیفری، تفاوت بین جرم سرقت و کلاهبرداری است.", type: "KNOWLEDGE", tags: '["کیفری", "آموزش", "جرم"]', likes: 54 } }),
      db.post.create({ data: { authorId: lawyer3.id, content: "سؤال از دوستان وکلا: آیا کسی تجربه تنظیم قرارداد فرانشای بین‌المللی دارد؟", type: "DISCUSSION", tags: '["تجاری", "بین‌المللی", "قرارداد"]', likes: 23 } }),
      db.post.create({ data: { authorId: intern1.id, content: "امروز از جلسه دادگاه خیلی چیز یاد گرفتم. نحوه بررسی شهادت‌ها و تطبیق با ادله اثبات دعوی.", type: "DISCUSSION", tags: '["آموزش", "تجربه", "دادگاه"]', likes: 41 } }),
      db.post.create({ data: { authorId: admin.id, title: "اطلاعیه: ارتقای سیستم امنیتی", content: "سیستم امنیتی پلتفرم ارتقا یافت.", type: "ANNOUNCEMENT", tags: '["سیستم", "امنیت", "آپدیت"]', isPinned: true, likes: 35 } }),
      db.post.create({ data: { authorId: lawyer1.id, title: "حقوق مستأجر در ابتدای قرن ۱۵", content: "با توجه به تورم شدید مسکن، حقوق مستأجران بیش از پیش اهمیت یافته است.", type: "ARTICLE", tags: '["حقوق مدنی", "مستأجر", "مسکن"]', likes: 89 } }),
    ]);

    // ============ EXTRA LEADS ============
    await Promise.all([
      db.lead.create({ data: { assignedToId: lawyer1.id, name: 'خانم رحمانی', email: 'rahmani@email.com', phone: '09361112233', source: 'وبسایت', status: 'CONTACTED', notes: 'نیاز به مشاوره حقوقی در زمینه طلاق و حضانت فرزند', value: 50000000 } }),
      db.lead.create({ data: { assignedToId: lawyer2.id, name: 'شرکت حمل و نقل سریع', email: 'info@speed-transport.ir', phone: '02133445566', source: 'ارجاع', status: 'QUALIFIED', notes: 'دعوی مطالبه وجه قرارداد حمل بار', value: 150000000 } }),
      db.lead.create({ data: { assignedToId: lawyer3.id, name: 'آقای بهرامی', email: 'bahrami@business.com', phone: '09123445566', source: 'لینکدین', status: 'NEW', notes: 'مشاوره حقوقی در زمینه ثبت شرکت خارجی', value: 100000000 } }),
      db.lead.create({ data: { assignedToId: lawyer1.id, name: 'خانم کاظمی', email: null, phone: '09378889900', source: 'تلفنی', status: 'CONVERTED', notes: 'تبدیل به مشتری - پرونده ملکی', value: 35000000 } }),
      db.lead.create({ data: { assignedToId: lawyer2.id, name: 'شرکت عمران نوین', email: 'contact@omran-novin.ir', phone: '02144556677', source: 'وبسایت', status: 'CONTACTED', notes: 'مشکلات قراردادی با پیمانکاران', value: 300000000 } }),
      db.lead.create({ data: { assignedToId: lawyer1.id, name: 'آقای محمدی', phone: '09192223344', source: 'حضوری', status: 'NEW', notes: 'دعوی ارث و تقسیم ترکه' } }),
    ]);

    // ============ EXTRA CALENDAR EVENTS ============
    await Promise.all([
      db.calendarEvent.create({ data: { userId: lawyer1.id, title: 'جلسه دادگاه - تخریب دیوار', description: 'شعبه ۷ دادگاه حقوقی', date: new Date('2024-08-15'), startTime: '09:00', endTime: '12:00', type: 'HEARING', color: '#ef4444' } }),
      db.calendarEvent.create({ data: { userId: lawyer1.id, title: 'جلسه با موکل - خانم جعفری', description: 'بررسی مدارک پرونده ابطال سند', date: new Date('2024-08-03'), startTime: '14:00', endTime: '15:00', type: 'MEETING', color: '#3b82f6' } }),
      db.calendarEvent.create({ data: { userId: lawyer2.id, title: 'مهلت ارسال لایحه', description: 'مهلت نهایی ارسال لایحه دفاعیه', date: new Date('2024-08-07'), type: 'DEADLINE', color: '#f59e0b' } }),
      db.calendarEvent.create({ data: { userId: manager.id, title: 'جلسه هیئت مدیره', description: 'بررسی عملکرد فصلی مجموعه', date: new Date('2024-08-01'), startTime: '09:00', endTime: '12:00', type: 'MEETING', color: '#8b5cf6' } }),
      db.calendarEvent.create({ data: { userId: accountant.id, title: 'مهلت اظهارنامه مالیاتی', description: 'ارسال اظهارنامه ترم دوم', date: new Date('2024-07-31'), type: 'DEADLINE', color: '#ef4444' } }),
      db.calendarEvent.create({ data: { userId: intern1.id, title: 'کلاس آموزشی حقوق تجارت', description: 'جلسه هفتگی دوره آموزشی', date: new Date('2024-08-04'), startTime: '10:00', endTime: '12:00', type: 'TASK', color: '#10b981' } }),
      db.calendarEvent.create({ data: { userId: lawyer3.id, title: 'قرارداد هلدینگ نور', description: 'جلسه نهایی بررسی قرارداد', date: new Date('2024-08-10'), startTime: '11:00', endTime: '13:00', type: 'MEETING', color: '#06b6d4' } }),
    ]);

    // ============ EXTRA TIME ENTRIES ============
    await Promise.all([
      db.timeEntry.create({ data: { userId: lawyer1.id, caseId: case6.id, date: new Date('2024-07-15'), hours: 2.5, description: 'بررسی مدارک و عکس‌های دیوار تخریب شده', isBilled: false } }),
      db.timeEntry.create({ data: { userId: lawyer1.id, caseId: case7.id, date: new Date('2024-07-20'), hours: 3, description: 'جستجوی سابقه ثبتی ملک مورد بحث', isBilled: false } }),
      db.timeEntry.create({ data: { userId: lawyer2.id, caseId: case9.id, date: new Date('2024-07-22'), hours: 4, description: 'بررسی قرارداد پیمانکاری و محاسبه مطالبات', isBilled: false } }),
      db.timeEntry.create({ data: { userId: lawyer3.id, caseId: case8.id, date: new Date('2024-07-25'), hours: 5, description: 'تحلیل اسناد شرکتی و تهیه نظریه حقوقی', isBilled: false } }),
      db.timeEntry.create({ data: { userId: lawyer3.id, caseId: case3.id, date: new Date('2024-07-28'), hours: 4, description: 'بازبینی نهایی قرارداد بین‌المللی', isBilled: true } }),
      db.timeEntry.create({ data: { userId: intern1.id, caseId: case6.id, date: new Date('2024-07-22'), hours: 2, description: 'جستجوی قوانین ملکی و تهیه خلاصه', isBilled: false } }),
      db.timeEntry.create({ data: { userId: intern2.id, caseId: case2.id, date: new Date('2024-07-25'), hours: 3, description: 'تهیه لیست شاهدان و هماهنگی جلسات', isBilled: false } }),
      db.timeEntry.create({ data: { userId: lawyer1.id, caseId: case10.id, date: new Date('2024-07-30'), hours: 1.5, description: 'بررسی گزارش تصادف و.photos', isBilled: false } }),
      db.timeEntry.create({ data: { userId: accountant.id, date: new Date('2024-07-28'), hours: 6, description: 'تهیه گزارش مالی تیرماه و تطبیق فاکتورها', isBilled: false } }),
      db.timeEntry.create({ data: { userId: support.id, date: new Date('2024-07-29'), hours: 8, description: 'پاسخگویی تیکت‌ها و پیگیری درخواست‌ها', isBilled: false } }),
    ]);

    // ============ EXTRA DOCUMENTS ============
    await Promise.all([
      db.document.create({ data: { name: 'سند مالکیت زمین.pdf', type: 'application/pdf', filePath: '/uploads/documents/ownership-deed.pdf', fileSize: 3072000, mimeType: 'application/pdf', category: 'legal', tags: '"ملک", "سند مالکیت"', uploadedBy: client1.id } }),
      db.document.create({ data: { name: 'قرارداد پیمانکاری.pdf', type: 'application/pdf', filePath: '/uploads/documents/contractor-agreement.pdf', fileSize: 4520000, mimeType: 'application/pdf', category: 'contract', tags: '"پیمانکاری", "قرارداد"', uploadedBy: client2.id } }),
      db.document.create({ data: { name: 'عکس‌های دیوار تخریب شده.zip', type: 'application/zip', filePath: '/uploads/documents/wall-photos.zip', fileSize: 15360000, mimeType: 'application/zip', category: 'evidence', tags: '"ملکی", "عکس"', uploadedBy: client1.id } }),
      db.document.create({ data: { name: 'گزارش کارشناس رسمی.pdf', type: 'application/pdf', filePath: '/uploads/documents/expert-report.pdf', fileSize: 2560000, mimeType: 'application/pdf', category: 'evidence', tags: '"کارشناس", "گزارش"', uploadedBy: lawyer1.id } }),
      db.document.create({ data: { name: 'اساسنامه شرکت.pdf', type: 'application/pdf', filePath: '/uploads/documents/articles-of-association.pdf', fileSize: 1843000, mimeType: 'application/pdf', category: 'corporate', tags: '"شرکتی", "اساسنامه"', uploadedBy: lawyer3.id } }),
      db.document.create({ data: { name: 'لایحه دفاعیه - پرونده ملکی.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', filePath: '/uploads/documents/defense-brief.docx', fileSize: 920000, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', category: 'legal', tags: '"لایحه", "دفاعیه"', uploadedBy: lawyer1.id } }),
    ]);

    // ============ EXTRA COURSES ============
    const course4 = await db.course.create({
      data: { title: 'آشنایی با حقوق خانواده', description: 'دوره جامع حقوق خانواده شامل ازدواج، طلاق، حضانت، نفقه و مهریه', instructorId: lawyer1.id, type: 'COURSE', status: 'PUBLISHED', duration: 540 },
    });
    const course5 = await db.course.create({
      data: { title: 'وبینار: حقوق کار و تأمین اجتماعی', description: 'بررسی آخرین تغییرات قانون کار و تأمین اجتماعی و حقوق کارگران', instructorId: lawyer2.id, type: 'WEBINAR', status: 'PUBLISHED', duration: 90 },
    });

    await Promise.all([
      db.lesson.create({ data: { courseId: course4.id, title: 'مقدمه حقوق خانواده', content: 'مفاهیم پایه حقوق خانواده...', order: 1, duration: 50 } }),
      db.lesson.create({ data: { courseId: course4.id, title: 'ازدواج و شروط ضمن عقد', content: 'انواع ازدواج و شروط قابل درج در عقدنامه...', order: 2, duration: 65 } }),
      db.lesson.create({ data: { courseId: course4.id, title: 'طلاق و احکام آن', content: 'انواع طلاق و شرایط هر کدام...', order: 3, duration: 55 } }),
      db.lesson.create({ data: { courseId: course5.id, title: 'قانون کار: مفاهیم پایه', content: 'تعریف کارگر و کارفرما...', order: 1, duration: 45 } }),
    ]);

    await Promise.all([
      db.enrollment.create({ data: { userId: intern1.id, courseId: course4.id, status: 'ACTIVE', progress: 15 } }),
      db.enrollment.create({ data: { userId: intern2.id, courseId: course4.id, status: 'ACTIVE', progress: 5 } }),
      db.enrollment.create({ data: { userId: lawyer2.id, courseId: course5.id, status: 'ACTIVE', progress: 50 } }),
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
        cases: 10,
        appointments: 12,
        invoices: 9,
        payments: 8,
        walletTransactions: 4,
        tasks: 13,
        notifications: 16,
        posts: 11,
        messages: 15,
        leads: 10,
        calendarEvents: 12,
        timeEntries: 17,
        documents: 10,
        courses: 5,
        enrollments: 8,
        lessons: 7,
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
