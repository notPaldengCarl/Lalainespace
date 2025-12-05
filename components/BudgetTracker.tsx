
import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Trash2, PieChart, Wallet, History, X } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { BudgetTransaction } from '../types';
import { BUDGET_CATEGORIES } from '../constants';

export const BudgetTracker: React.FC = () => {
  const [transactions, setTransactions] = useState<BudgetTransaction[]>(() => {
    const saved = localStorage.getItem('lalaine_budget');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('lalaine_budget', JSON.stringify(transactions));
  }, [transactions]);

  const openAddModal = () => {
    const Swal = (window as any).Swal;
    if (!Swal) return;

    Swal.fire({
      title: 'Add Transaction',
      html: `
        <div class="flex flex-col gap-3 text-left">
          <div>
            <label class="text-xs font-bold uppercase text-gray-500">Type</label>
            <div class="flex gap-2 mt-1">
              <input type="radio" id="expense" name="type" value="expense" checked class="hidden peer/expense">
              <label for="expense" class="flex-1 text-center py-2 rounded-lg border border-gray-200 cursor-pointer peer-checked/expense:bg-rose-100 peer-checked/expense:text-rose-600 peer-checked/expense:border-rose-200 hover:bg-gray-50 transition-colors">Expense</label>
              
              <input type="radio" id="income" name="type" value="income" class="hidden peer/income">
              <label for="income" class="flex-1 text-center py-2 rounded-lg border border-gray-200 cursor-pointer peer-checked/income:bg-green-100 peer-checked/income:text-green-600 peer-checked/income:border-green-200 hover:bg-gray-50 transition-colors">Income</label>
            </div>
          </div>
          
          <div>
            <label class="text-xs font-bold uppercase text-gray-500">Details</label>
            <input id="swal-title" class="swal2-input !m-0 !mt-1 !w-full !text-base" placeholder="What is it?">
          </div>

          <div>
             <label class="text-xs font-bold uppercase text-gray-500">Amount</label>
             <input id="swal-amount" type="number" class="swal2-input !m-0 !mt-1 !w-full !text-base" placeholder="0.00">
          </div>

          <div id="category-container">
            <label class="text-xs font-bold uppercase text-gray-500">Category</label>
            <select id="swal-category" class="swal2-select !m-0 !mt-1 !w-full !text-base !py-2">
              ${BUDGET_CATEGORIES.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Add',
      didOpen: () => {
        const typeInputs = document.querySelectorAll('input[name="type"]');
        const catContainer = document.getElementById('category-container');
        typeInputs.forEach(input => {
          input.addEventListener('change', (e: any) => {
             if (catContainer) catContainer.style.display = e.target.value === 'income' ? 'none' : 'block';
          });
        });
      },
      preConfirm: () => {
        const title = (document.getElementById('swal-title') as HTMLInputElement).value;
        const amount = (document.getElementById('swal-amount') as HTMLInputElement).value;
        const type = (document.querySelector('input[name="type"]:checked') as HTMLInputElement).value as 'income' | 'expense';
        const category = (document.getElementById('swal-category') as HTMLSelectElement).value;

        if (!title || !amount) {
          Swal.showValidationMessage('Please enter description and amount');
          return false;
        }
        return { title, amount: parseFloat(amount), type, category };
      }
    }).then((result: any) => {
      if (result.isConfirmed) {
        const { title, amount, type, category } = result.value;
        const newTransaction: BudgetTransaction = {
          id: Date.now().toString(),
          title,
          amount,
          type,
          category: type === 'income' ? 'salary' : category,
          date: new Date().toISOString()
        };
        setTransactions(prev => [newTransaction, ...prev]);
      }
    });
  };

  const handleDelete = (id: string) => {
    const Swal = (window as any).Swal;
    if (Swal) {
      Swal.fire({
        title: 'Delete Item?',
        text: 'Remove this transaction?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonText: 'Cancel',
        customClass: {
            container: 'z-[120]' // Ensure it's above history modal if open
        }
      }).then((result: any) => {
        if (result.isConfirmed) {
           setTransactions(transactions.filter(t => t.id !== id));
        }
      });
    } else {
       if(confirm("Delete this transaction?")) setTransactions(transactions.filter(t => t.id !== id));
    }
  };
  
  const handleClear = () => {
    const Swal = (window as any).Swal;
    if (Swal) {
      Swal.fire({
        title: 'Clear History?',
        text: 'This will remove all budget transactions.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, clear all',
      }).then((result: any) => {
        if (result.isConfirmed) {
          setTransactions([]);
        }
      });
    } else {
      if (confirm("Are you sure you want to clear your entire budget history?")) {
        setTransactions([]);
      }
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;
  const spendPercentage = totalIncome > 0 ? Math.min((totalExpense / totalIncome) * 100, 100) : 0;

  // Group transactions by Date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, BudgetTransaction[]>);

  const getCategoryInfo = (id: string) => BUDGET_CATEGORIES.find(c => c.id === id) || BUDGET_CATEGORIES[6];

  const TransactionList = ({ limit }: { limit?: number }) => {
    let count = 0;
    return (
        <div className="space-y-4">
             {Object.keys(groupedTransactions).map(date => {
                 if (limit && count >= limit) return null;
                 const isToday = new Date(date).toDateString() === new Date().toDateString();
                 
                 const daysTxns = groupedTransactions[date];
                 // If limited, slice the array
                 const visibleTxns = limit ? daysTxns.slice(0, limit - count) : daysTxns;
                 if (visibleTxns.length === 0) return null;

                 count += visibleTxns.length;

                 return (
                    <div key={date}>
                      <div className="sticky top-0 bg-panel/95 backdrop-blur-sm z-10 py-1.5 mb-1 border-b border-mocha/5 flex items-center">
                        <span className="text-[10px] font-bold text-mocha/60 uppercase tracking-widest pl-1">
                          {isToday ? 'Today' : date}
                        </span>
                        <div className="h-px bg-mocha/10 flex-1 ml-2"></div>
                      </div>
                      <div className="space-y-2">
                        {visibleTxns.map(t => {
                          const catInfo = getCategoryInfo(t.category);
                          return (
                            <div key={t.id} className="flex justify-between items-center p-2.5 rounded-xl bg-white/60 hover:bg-white transition-all group border border-transparent hover:border-accentLight/20 shadow-sm cursor-default">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base shadow-sm ${t.type === 'income' ? 'bg-green-100 text-green-700' : `${catInfo.color.split(' ')[0]} ${catInfo.color.split(' ')[1]}`}`}>
                                      {t.type === 'income' ? '💰' : catInfo.icon}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-sm text-coffee font-semibold truncate leading-tight">{t.title}</span>
                                    <span className="text-[10px] text-mocha">{t.type === 'income' ? 'Income' : catInfo.name}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 pl-2">
                                  <span className={`text-sm font-bold whitespace-nowrap ${t.type === 'income' ? 'text-green-600' : 'text-coffee'}`}>
                                    {t.type === 'income' ? '+' : '-'}₱{t.amount.toLocaleString()}
                                  </span>
                                  <button onClick={() => handleDelete(t.id)} className="opacity-0 group-hover:opacity-100 text-mocha/40 hover:text-red-500 transition-all p-1.5 hover:bg-red-50 rounded-lg">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                 );
             })}
        </div>
    )
  }

  return (
    <>
        <Card 
        title="Budget" 
        icon={<Wallet size={24} />} 
        className="h-full flex flex-col overflow-hidden"
        action={
            <div className="flex gap-1">
            <button onClick={() => setIsHistoryOpen(true)} className="text-mocha hover:text-accent transition-colors p-1.5 bg-white/50 rounded-lg" title="View History">
                <History size={16} />
            </button>
            <button onClick={openAddModal} className="text-mocha hover:text-accent transition-colors p-1.5 bg-white/50 rounded-lg" title="Add Transaction">
                <Plus size={16} />
            </button>
            <button onClick={handleClear} className="text-mocha/40 hover:text-red-500 transition-colors p-1.5 hover:bg-white/50 rounded-lg" title="Clear History">
                <Trash2 size={16} />
            </button>
            </div>
        }
        >
        <div className="flex flex-col h-full gap-3 min-h-0">
            
            {/* Balance Card with Spending Bar */}
            <div className="bg-gradient-to-br from-accent to-mocha text-white p-4 rounded-2xl shadow-md flex-shrink-0 relative overflow-hidden transition-transform hover:scale-[1.01]">
            <div className="flex justify-between items-start z-10 relative">
                <div>
                <p className="text-white/80 text-[10px] uppercase font-bold tracking-wider mb-1">Total Balance</p>
                <h2 className="text-2xl font-serif font-bold">₱{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                </div>
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <PieChart size={20} className="text-white" />
                </div>
            </div>

            <div className="mt-4">
                <div className="flex justify-between text-[10px] text-white/90 mb-1.5 font-medium">
                <span>Expense: ₱{totalExpense.toLocaleString()}</span>
                <span>Income: ₱{totalIncome.toLocaleString()}</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden backdrop-blur-sm">
                    <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${spendPercentage > 90 ? 'bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.5)]' : 'bg-green-300'}`} 
                    style={{ width: `${spendPercentage}%` }}
                    />
                </div>
            </div>
            </div>

            {/* Recent List (Limited) */}
            <div className="flex-1 overflow-hidden relative">
                <h3 className="text-[10px] font-bold text-mocha/50 uppercase tracking-widest mb-2">Recent</h3>
                <div className="overflow-y-auto h-full custom-scrollbar pr-1 pb-1">
                    {Object.keys(groupedTransactions).length === 0 && (
                        <div className="text-center text-mocha/40 text-xs py-8 italic flex flex-col items-center justify-center">
                            <p>No transactions yet.</p>
                            <Button onClick={openAddModal} variant="ghost" size="sm" className="mt-2 text-accent">Add First</Button>
                        </div>
                    )}
                    {/* Show only last 5 items to keep it clean */}
                    <TransactionList limit={5} />
                </div>
            </div>
        </div>
        </Card>

        {/* History Modal */}
        {isHistoryOpen && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cream/90 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-panel w-full max-w-md h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/20 relative">
                     <div className="p-4 border-b border-mocha/10 flex justify-between items-center bg-white/40">
                         <h2 className="font-serif text-xl font-bold text-coffee">Transaction History</h2>
                         <button onClick={() => setIsHistoryOpen(false)} className="p-2 bg-white/50 rounded-full hover:bg-white text-mocha transition-colors">
                             <X size={20} />
                         </button>
                     </div>
                     <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                         {transactions.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-mocha/50">
                                <Wallet size={48} className="mb-4 opacity-20" />
                                <p>No history found.</p>
                            </div>
                         ) : (
                            <TransactionList />
                         )}
                     </div>
                </div>
             </div>
        )}
    </>
  );
};
