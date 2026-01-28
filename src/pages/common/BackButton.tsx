import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../ui/Button';

export const BackButton: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-xl text-gray-500 hover:text-gray-900"
        >
            <ArrowLeft className="h-4 w-4" />
            Back
        </Button>
    );
};

export default BackButton;
