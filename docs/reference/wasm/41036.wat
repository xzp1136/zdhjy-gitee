  (func (;41036;) (type 7) (param i32 i32 i32 i32 i32)
    (local i32 i32 i32 i32 i32 i32)
    global.get 0
    i32.const 32
    i32.sub
    local.tee 4
    global.set 0
    i32.const 4365131
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3356428
      call 2180
      i32.const 3376224
      call 2180
      i32.const 3376288
      call 2180
      i32.const 3376244
      call 2180
      i32.const 3376220
      call 2180
      i32.const 3376256
      call 2180
      i32.const 3346768
      call 2180
      i32.const 3359088
      call 2180
      i32.const 3359256
      call 2180
      i32.const 3385852
      call 2180
      i32.const 3387844
      call 2180
      i32.const 3387848
      call 2180
      i32.const 3385856
      call 2180
      i32.const 3482572
      call 2180
      i32.const 3482564
      call 2180
      i32.const 4365131
      i32.const 1
      i32.store8
    end
    local.get 4
    i32.const 0
    i32.store offset=20
    local.get 4
    i32.const 0
    i32.store offset=16
    local.get 4
    i32.const 0
    i32.store offset=12
    block  ;; label = @1
      local.get 1
      i32.load offset=40
      local.tee 5
      i32.eqz
      br_if 0 (;@1;)
      local.get 5
      i32.load offset=12
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      i32.const 3346768
      i32.load
      call 1900
      local.tee 8
      i32.const 3376220
      i32.load
      call 34422
      local.get 1
      i32.load offset=40
      local.tee 5
      i32.load offset=12
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      loop  ;; label = @2
        local.get 5
        local.get 7
        local.get 4
        i32.const 28
        i32.add
        i32.const 3385856
        i32.load
        call 50458
        block  ;; label = @3
          local.get 4
          i32.load offset=28
          local.tee 5
          i32.eqz
          br_if 0 (;@3;)
          local.get 5
          i32.load offset=12
          i32.const 2
          i32.lt_s
          br_if 0 (;@3;)
          local.get 5
          i32.const 0
          local.get 4
          i32.const 28
          i32.add
          i32.const 3387848
          i32.load
          call 50458
          i32.const 3376244
          i32.load
          local.set 5
          local.get 4
          local.get 4
          i32.load offset=28
          local.tee 6
          i32.store offset=28
          local.get 8
          local.get 4
          i32.const 28
          i32.add
          local.get 4
          i32.const 20
          i32.add
          local.get 5
          call 34286
          if  ;; label = @4
            i32.const 3376256
            i32.load
            local.set 5
            local.get 4
            i32.load offset=20
            local.set 9
            local.get 4
            local.get 6
            i32.store offset=28
            local.get 4
            local.get 9
            i32.const 1
            i32.add
            i32.store offset=24
            local.get 8
            local.get 4
            i32.const 28
            i32.add
            local.get 4
            i32.const 24
            i32.add
            local.get 5
            call 34436
            br 1 (;@3;)
          end
          i32.const 3376224
          i32.load
          local.set 5
          local.get 4
          local.get 6
          i32.store offset=28
          local.get 4
          i32.const 1
          i32.store offset=24
          local.get 8
          local.get 4
          i32.const 28
          i32.add
          local.get 4
          i32.const 24
          i32.add
          local.get 5
          call 34391
        end
        local.get 7
        i32.const 1
        i32.add
        local.tee 7
        local.get 1
        i32.load offset=40
        local.tee 5
        i32.load offset=12
        local.tee 6
        i32.lt_s
        br_if 0 (;@2;)
      end
      local.get 6
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      i32.const 0
      local.set 7
      loop  ;; label = @2
        local.get 5
        local.get 7
        local.get 4
        i32.const 28
        i32.add
        i32.const 3385856
        i32.load
        call 50458
        block  ;; label = @3
          local.get 4
          i32.load offset=28
          local.tee 5
          i32.eqz
          br_if 0 (;@3;)
          local.get 5
          i32.load offset=12
          i32.const 2
          i32.lt_s
          br_if 0 (;@3;)
          local.get 5
          i32.const 0
          local.get 4
          i32.const 28
          i32.add
          i32.const 3387848
          i32.load
          call 50458
          local.get 4
          i32.load offset=28
          local.set 6
          local.get 5
          i32.const 1
          local.get 4
          i32.const 28
          i32.add
          i32.const 3387848
          i32.load
          call 50458
          local.get 4
          i32.load offset=28
          local.set 9
          i32.const 3376244
          i32.load
          local.set 5
          local.get 4
          local.get 6
          i32.store offset=28
          block  ;; label = @4
            block  ;; label = @5
              local.get 8
              local.get 4
              i32.const 28
              i32.add
              local.get 4
              i32.const 16
              i32.add
              local.get 5
              call 34286
              i32.eqz
              br_if 0 (;@5;)
              local.get 4
              i32.load offset=16
              local.tee 5
              i32.const 2
              i32.lt_s
              br_if 0 (;@5;)
              local.get 5
              i32.const 1
              i32.and
              i32.eqz
              br_if 1 (;@4;)
            end
            local.get 4
            local.get 6
            i32.store offset=28
            i32.const 3359088
            i32.load
            local.get 4
            i32.const 28
            i32.add
            call 2193
            local.set 5
            local.get 4
            local.get 4
            i32.load offset=16
            i32.store offset=24
            i32.const 3359088
            i32.load
            local.get 4
            i32.const 24
            i32.add
            call 2193
            local.set 6
            i32.const 3482564
            i32.load
            local.get 5
            local.get 6
            i32.const 0
            call 48227
            local.set 5
            i32.const 3356428
            i32.load
            local.tee 6
            i32.load offset=116
            i32.eqz
            if  ;; label = @5
              local.get 6
              call 60460
            end
            local.get 5
            i32.const 0
            call 55817
            br 1 (;@3;)
          end
          i32.const 3359256
          i32.load
          local.tee 5
          i32.load offset=116
          i32.eqz
          if  ;; label = @4
            local.get 5
            call 60460
            i32.const 3359256
            i32.load
            local.set 5
          end
          i32.const 3376288
          i32.load
          local.set 10
          local.get 5
          i32.load offset=92
          i32.load
          local.set 5
          local.get 4
          local.get 6
          i32.store offset=28
          local.get 5
          local.get 4
          i32.const 28
          i32.add
          local.get 4
          i32.const 12
          i32.add
          local.get 10
          call 34286
          i32.eqz
          if  ;; label = @4
            local.get 4
            local.get 6
            i32.store offset=28
            i32.const 3359088
            i32.load
            local.get 4
            i32.const 28
            i32.add
            call 2193
            local.set 5
            i32.const 3482572
            i32.load
            local.get 5
            i32.const 0
            call 48011
            local.set 5
            i32.const 3356428
            i32.load
            local.tee 6
            i32.load offset=116
            i32.eqz
            if  ;; label = @5
              local.get 6
              call 60460
            end
            local.get 5
            i32.const 0
            call 55817
            br 1 (;@3;)
          end
          local.get 0
          local.get 6
          local.get 9
          i32.const 100
          local.get 9
          i32.const 100
          i32.lt_s
          select
          local.tee 5
          i32.const 0
          local.get 5
          i32.const 0
          i32.gt_s
          select
          local.get 4
          i32.load offset=12
          local.get 2
          local.get 3
          local.get 4
          call 41038
        end
        local.get 7
        i32.const 1
        i32.add
        local.tee 7
        local.get 1
        i32.load offset=40
        local.tee 5
        i32.load offset=12
        i32.lt_s
        br_if 0 (;@2;)
      end
    end
    local.get 4
    i32.const 32
    i32.add
    global.set 0)
