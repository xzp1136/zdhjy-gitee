  (func (;44276;) (type 1) (param i32 i32)
    i32.const 4367315
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3353920
      call 2180
      i32.const 3445972
      call 2180
      i32.const 4367315
      i32.const 1
      i32.store8
    end
    i32.const 3353920
    i32.load
    i32.const 1
    call 2185
    local.tee 1
    i32.const 3445972
    i32.load
    i32.store offset=16
    local.get 0
    local.get 1
    i32.const 0
    call 48865
    i32.store offset=44)
