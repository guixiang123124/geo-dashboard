'use client';

import React, { useState } from 'react';
import { Download, FileText, Image, Loader2 } from 'lucide-react';
import { Button } from './button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './dropdown-menu';

interface ExportButtonProps {
    onExportCSV?: () => Promise<void>;
    onExportPNG?: () => Promise<void>;
    disabled?: boolean;
    size?: 'sm' | 'default' | 'lg';
}

export function ExportButton({ onExportCSV, onExportPNG, disabled, size = 'default' }: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (type: 'csv' | 'png') => {
        setIsExporting(true);
        try {
            if (type === 'csv' && onExportCSV) {
                await onExportCSV();
            } else if (type === 'png' && onExportPNG) {
                await onExportPNG();
            }
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size={size} disabled={disabled || isExporting}>
                    {isExporting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Download className="w-4 h-4 mr-2" />
                    )}
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {onExportCSV && (
                    <DropdownMenuItem onClick={() => handleExport('csv')}>
                        <FileText className="w-4 h-4 mr-2" />
                        Export as CSV
                    </DropdownMenuItem>
                )}
                {onExportPNG && (
                    <DropdownMenuItem onClick={() => handleExport('png')}>
                        <Image className="w-4 h-4 mr-2" />
                        Export as PNG
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
