package com.nominacopro.data.local

import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase

object NominaMigrations {

    val MIGRATION_1_2 = object : Migration(1, 2) {
        override fun migrate(db: SupportSQLiteDatabase) {
            db.execSQL(
                """
                CREATE TABLE IF NOT EXISTS manual_deductions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                    yearMonth TEXT NOT NULL,
                    label TEXT NOT NULL,
                    amount INTEGER NOT NULL
                )
                """.trimIndent(),
            )
        }
    }

    val MIGRATION_2_3 = object : Migration(2, 3) {
        override fun migrate(db: SupportSQLiteDatabase) {
            db.execSQL("ALTER TABLE manual_deductions ADD COLUMN cloudId TEXT")
        }
    }

    val MIGRATION_3_4 = object : Migration(3, 4) {
        override fun migrate(db: SupportSQLiteDatabase) {
            db.execSQL(
                "ALTER TABLE profile ADD COLUMN contractType TEXT NOT NULL DEFAULT 'INDEFINIDO'",
            )
        }
    }

    val MIGRATION_4_5 = object : Migration(4, 5) {
        override fun migrate(db: SupportSQLiteDatabase) {
            db.execSQL(
                "ALTER TABLE profile ADD COLUMN payPeriodType TEXT NOT NULL DEFAULT 'BIWEEKLY'",
            )
            db.execSQL("ALTER TABLE manual_deductions ADD COLUMN effectiveDateIso TEXT")
            db.execSQL(
                """
                UPDATE manual_deductions
                SET effectiveDateIso = yearMonth || '-01'
                WHERE effectiveDateIso IS NULL
                """.trimIndent(),
            )
            db.execSQL(
                "ALTER TABLE manual_deductions ADD COLUMN entryType TEXT NOT NULL DEFAULT 'DEDUCTION'",
            )
        }
    }

    val MIGRATION_5_6 = object : Migration(5, 6) {
        override fun migrate(db: SupportSQLiteDatabase) {
            db.execSQL(
                "ALTER TABLE profile ADD COLUMN pendingVacationDays INTEGER NOT NULL DEFAULT 0",
            )
        }
    }

    val MIGRATION_6_9 = object : Migration(6, 9) {
        override fun migrate(db: SupportSQLiteDatabase) {
            db.execSQL(
                """
                CREATE TABLE IF NOT EXISTS expense_entries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                    cloudId TEXT,
                    yearMonth TEXT NOT NULL,
                    dateIso TEXT NOT NULL,
                    label TEXT NOT NULL,
                    amount INTEGER NOT NULL,
                    category TEXT NOT NULL DEFAULT 'OTHER',
                    isFixed INTEGER NOT NULL DEFAULT 0
                )
                """.trimIndent(),
            )
        }
    }

    val ALL: Array<Migration> = arrayOf(
        MIGRATION_1_2,
        MIGRATION_2_3,
        MIGRATION_3_4,
        MIGRATION_4_5,
        MIGRATION_5_6,
        MIGRATION_6_9,
    )
}
