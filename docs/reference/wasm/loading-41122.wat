  (func (;41122;) (type 1) (param i32 i32)
    i32.const 4365199
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3456392
      call 2180
      i32.const 3450640
      call 2180
      i32.const 3470640
      call 2180
      i32.const 4365199
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.const 3450640
    i32.load
    i32.store offset=16
    local.get 0
    i32.const 3456392
    i32.load
    local.tee 1
    i32.store offset=24
    local.get 0
    local.get 1
    i32.store offset=20
    i32.const 3470640
    i32.load
    local.set 1
    local.get 0
    i32.const 1008981770
    i32.store offset=52
    local.get 0
    local.get 1
    i32.store offset=28
    local.get 0
    i32.const 0
    call 48709)
