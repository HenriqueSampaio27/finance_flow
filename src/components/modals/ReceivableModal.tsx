import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Plus } from "lucide-react";
import { styles } from "../../theme";
import { ClientItem } from "@/src/types/clientType";
import { ReceivableItem, StatusRecebimento } from "../../types/receivableType";
import { formatCurrency } from "../../utils/formatters";

interface ReceivableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReceivable: (receivable: Omit<ReceivableItem, "id">) => void;
  client: ClientItem[];
}
const STATUS_OPTIONS: { value: StatusRecebimento; label: string }[] = [
  { value: "pending", label: "Pendente" },
  { value: "paid", label: "Recebido" },
  { value: "late", label: "Atrasado" },
  { value: "canceled", label: "Cancelado" },
];

// Data local no formato YYYY-MM-DD
const hoje = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

interface FormState {
  document_id: string;
  entry_date: string;
  due_date: string;
  original_amount: string;
  received_amount: string;
  installment: string;
  status: StatusRecebimento;
}

const criarEstadoInicial = (): FormState => ({
  document_id: "",
  entry_date: hoje(),
  due_date: "",
  original_amount: "",
  received_amount: "0",
  installment: "1",
  status: "pending",
});

type Erros = Partial<Record<keyof FormState | "client", string>>;

const arredondar = (n: number) => Math.round(n * 100) / 100;

export const ReceivableModal: React.FC<ReceivableModalProps> = ({
  isOpen,
  onClose,
  onAddReceivable,
  client,
}) => {
  const clientBoxRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<FormState>(criarEstadoInicial);
  const [clientSearch, setClientSearch] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<ClientItem | null>(null);
  const [showClients, setShowClients] = useState(false);
  const [erros, setErros] = useState<Erros>({});

  // Fecha a lista de clientes ao clicar fora (input + lista dentro do mesmo wrapper)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        clientBoxRef.current &&
        !clientBoxRef.current.contains(event.target as Node)
      ) {
        setShowClients(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sempre que o modal abrir, começa com o formulário limpo
  useEffect(() => {
    if (isOpen) {
      setFormData(criarEstadoInicial());
      setClientSearch("");
      setClienteSelecionado(null);
      setShowClients(false);
      setErros({});
    }
  }, [isOpen]);

  const original = parseFloat(formData.original_amount) || 0;
  const recebido = parseFloat(formData.received_amount) || 0;
  const saldo = useMemo(() => arredondar(original - recebido), [original, recebido]);

  const filteredClients = useMemo(
    () =>
      client.filter((c) =>
        c.name.toLowerCase().includes(clientSearch.toLowerCase())
      ),
    [client, clientSearch]
  );

  if (!isOpen) return null;

  /* ------------------------------ handlers ------------------------------- */

  const limparErro = (campo: keyof Erros) =>
    setErros((prev) => ({ ...prev, [campo]: undefined }));

  const handleChange = <K extends keyof FormState>(campo: K, valor: FormState[K]) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
    limparErro(campo);
  };

  // Ao mudar os valores, mantém o status coerente com o saldo
  const handleAmountChange = (
    campo: "original_amount" | "received_amount",
    valor: string
  ) => {
    setFormData((prev) => {
      const next = { ...prev, [campo]: valor };
      const o = parseFloat(next.original_amount) || 0;
      const r = parseFloat(next.received_amount) || 0;

      if (o > 0 && r >= o) {
        next.status = "paid";
      } else if (prev.status === "paid") {
        next.status = "pending";
      }
      return next;
    });
    limparErro(campo);
  };

  const handleSelectClient = (c: ClientItem) => {
    if (!c.id) return;
    setClienteSelecionado(c);
    setClientSearch(c.name);
    setShowClients(false);
    limparErro("client");
  };

  const validar = (): Erros => {
    const e: Erros = {};

    if (!clienteSelecionado) e.client = "Selecione um cliente da lista.";
    if (!formData.document_id.trim()) e.document_id = "Informe o nº do documento.";
    if (!formData.entry_date) e.entry_date = "Informe a data de emissão.";
    if (!formData.due_date) e.due_date = "Informe o vencimento.";
    if (formData.entry_date && formData.due_date && formData.due_date < formData.entry_date) {
      e.due_date = "O vencimento não pode ser anterior à emissão.";
    }
    if (original <= 0) e.original_amount = "Informe um valor maior que zero.";
    if (recebido < 0) e.received_amount = "O valor recebido não pode ser negativo.";
    if (recebido > original) e.received_amount = "O recebido não pode ser maior que o valor original.";
    if (!formData.installment) {
            e.installment = "Digite o número de parcelas";
        } else if (!/^\d+$/.test(formData.installment)) {
            e.installment = "Digite somente números";
        } else if (!/^[1-9]\d*$/.test(formData.installment)) {
            e.installment = "Digite um número inteiro maior que zero";
        }
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const encontrados = validar();
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0 || !clienteSelecionado?.id) return;

    const novoItem: Omit<ReceivableItem, "id"> = {
      client_id: Number(clienteSelecionado.id),
      document_id: formData.document_id.trim(),
      entry_date: formData.entry_date,
      due_date: formData.due_date,
      original_amount: arredondar(original),
      received_amount: arredondar(recebido),
      balance: saldo,
      installment: formData.installment.trim(),
      status: formData.status,
    };

    onAddReceivable(novoItem);
    onClose();
  };

  const inputErro = (campo: keyof Erros) =>
    erros[campo] ? "border-red-300 focus:ring-red-200" : "";

  const MensagemErro = ({ campo }: { campo: keyof Erros }) =>
    erros[campo] ? (
      <p className="mt-1 text-xs font-medium text-red-500">{erros[campo]}</p>
    ) : null;

  /* -------------------------------- render ------------------------------- */

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Novo Recebimento</h3>
              <p className="text-xs text-slate-400">
                Registre um valor a receber de um cliente.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Cliente */}
          <div className="relative" ref={clientBoxRef}>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Cliente
            </label>
            <input
              type="text"
              placeholder="Digite o nome do cliente"
              value={clientSearch}
              onFocus={() => setShowClients(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
              }}
              onChange={(e) => {
                setClientSearch(e.target.value);
                setClienteSelecionado(null); // exige escolher de novo da lista
                setShowClients(true);
                limparErro("client");
              }}
              className={`${styles.input} ${inputErro("client")}`}
            />
            <MensagemErro campo="client" />

            {showClients && (
              <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredClients.length > 0 ? (
                  filteredClients.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectClient(c)}
                      className="w-full text-left px-3 py-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="text-sm font-medium text-slate-800">{c.name}</div>
                      {c.cpf && <div className="text-xs text-slate-400">{c.cpf}</div>}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-3 text-sm text-slate-400">
                    Nenhum cliente encontrado
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Documento + Parcela */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nº do Documento
              </label>
              <input
                type="text"
                placeholder="Ex: NF-891"
                value={formData.document_id}
                onChange={(e) => handleChange("document_id", e.target.value)}
                className={`${styles.input} ${inputErro("document_id")}`}
              />
              <MensagemErro campo="document_id" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nº de Parcelas
              </label>
              <input
                type="text"
                placeholder="Ex: 4"
                value={formData.installment}
                onChange={(e) => handleChange("installment", e.target.value)}
                className={`${styles.input} ${inputErro("installment")}`}
              />
              <MensagemErro campo="installment" />
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Data de Emissão
              </label>
              <input
                type="date"
                value={formData.entry_date}
                onChange={(e) => handleChange("entry_date", e.target.value)}
                className={`${styles.input} ${inputErro("entry_date")}`}
              />
              <MensagemErro campo="entry_date" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Vencimento
              </label>
              <input
                type="date"
                min={formData.entry_date || undefined}
                value={formData.due_date}
                onChange={(e) => handleChange("due_date", e.target.value)}
                className={`${styles.input} ${inputErro("due_date")}`}
              />
              <MensagemErro campo="due_date" />
            </div>
          </div>

          {/* Valores */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Valor Original (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={formData.original_amount}
                onChange={(e) => handleAmountChange("original_amount", e.target.value)}
                className={`${styles.input} ${inputErro("original_amount")}`}
              />
              <MensagemErro campo="original_amount" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Valor Recebido (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={formData.received_amount}
                onChange={(e) => handleAmountChange("received_amount", e.target.value)}
                className={`${styles.input} ${inputErro("received_amount")}`}
              />
              <MensagemErro campo="received_amount" />
            </div>
          </div>

          {/* Saldo (calculado) + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Saldo a Receber
              </label>
              <div
                className={`${styles.input} bg-slate-50 font-semibold cursor-not-allowed ${
                  saldo < 0 ? "text-red-600" : "text-slate-800"
                }`}
              >
                {formatCurrency(saldo)}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Calculado: original − recebido.
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  handleChange("status", e.target.value as StatusRecebimento)
                }
                className={styles.input}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className={styles.secondaryButton}>
              Cancelar
            </button>
            <button type="submit" className={styles.primaryButton}>
              Salvar Recebimento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
