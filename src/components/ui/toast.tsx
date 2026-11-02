import { Toaster as Sonner, toast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

export const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-surface-2 group-[.toaster]:text-text group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-[6px]',
          description: 'group-[.toast]:text-text-2',
          actionButton:
            'group-[.toast]:bg-accent group-[.toast]:text-text group-[.toast]:hover:bg-accent-hover font-medium rounded-[4px] px-2 py-1',
          cancelButton:
            'group-[.toast]:bg-surface group-[.toast]:text-text-2 group-[.toast]:hover:bg-surface-2 rounded-[4px]',
        },
      }}
      {...props}
    />
  );
};

export { toast };
